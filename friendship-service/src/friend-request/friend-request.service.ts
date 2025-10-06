import { PrismaService } from '@/configs/db/prisma.service';
import type { TFriendRequest } from '@/utils/entities/friend.entity';
import { EProviderTokens } from '@/utils/enums';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EFriendRequestMessages } from './friend-request.message';
// import { UserService } from '@/user/user.service'
import { UserConnectionService } from '@/connection/user-connection.service';
import { EFriendRequestStatus } from './friend-request.enum';
import {
  FriendRequestActionDTO,
  GetFriendRequestsDTO,
} from './friend-request.dto';
import { TGetFriendRequestsData } from './friend-request.type';
import type {
  TDiscriminatedQueryReturn,
  TSignatureObject,
} from '@/utils/types';
import { Prisma } from '@prisma/client';
// import { BlockUserService } from '@/user/block-user.service'
import { EUserMessages } from '@/user/user.message';
import { ClientGrpc } from '@nestjs/microservices';
import type {
  CheckBlockedUserRequest,
  CheckBlockedUserResponse,
  FindUserRequest,
  UserService,
  UserWithProfile,
} from './user';
@Injectable()
export class FriendRequestService {
  private userServiceClient: UserService;
  constructor(
    @Inject(EProviderTokens.PRISMA_CLIENT) private PrismaService: PrismaService,
    @Inject('USER_PACKAGE') private UserService: ClientGrpc,
    private userConnectionService: UserConnectionService,
    //  private blockUserService: BlockUserService
  ) {
    this.userServiceClient =
      this.UserService.getService<UserService>('UserService');
  }

  async create<R extends TFriendRequest>(
    senderId: number,
    recipientId: number,
    returnType?: TDiscriminatedQueryReturn<
      Prisma.FriendRequestSelect,
      Prisma.FriendRequestInclude,
      Prisma.FriendRequestOmit
    >,
  ): Promise<R> {
    return (await this.PrismaService.friendRequest.create({
      data: {
        status: 'PENDING',
        recipientId,
        senderId,
      },
      ...(returnType ? { ...returnType } : {}),
    })) as R;
  }

  async update<R>(
    requestId: number,
    senderId: number,
    recipientId: number,
    status: EFriendRequestStatus,
    returnType?: TDiscriminatedQueryReturn<
      Prisma.FriendRequestSelect,
      Prisma.FriendRequestInclude,
      Prisma.FriendRequestOmit
    >,
  ): Promise<R> {
    return (await this.PrismaService.friendRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status,
        senderId,
        recipientId,
        updatedAt: new Date(),
      },
      ...(returnType ? { ...returnType } : {}),
    })) as R;
  }

  async findFriendRequest(
    senderId: number,
    recipientId: number,
  ): Promise<TFriendRequest | null> {
    return await this.PrismaService.friendRequest.findFirst({
      where: { senderId, recipientId },
    });
  }

  async findSentFriendRequest(
    senderId: number,
    recipientId: number,
  ): Promise<TFriendRequest | null> {
    const relatedUsers = [senderId, recipientId];
    return await this.PrismaService.friendRequest.findFirst({
      where: {
        senderId: { in: relatedUsers },
        recipientId: { in: relatedUsers },
      },
    });
  }

  async checkBlockedUser(
    data: CheckBlockedUserRequest,
  ): Promise<CheckBlockedUserResponse> {
    const response = await this.userServiceClient.CheckBlockedUser(data);

    return response;
  }

  async findUserWithProfileById(
    data: FindUserRequest,
  ): Promise<UserWithProfile> {
    const response = await this.userServiceClient.FindUserWithProfileById(data);

    return response;
  }

  async sendFriendRequest(
    senderId: number,
    recipientId: number,
  ): Promise<TGetFriendRequestsData> {
    // Kiểm tra nếu người gửi và người nhận là cùng một người
    if (senderId === recipientId) {
      throw new BadRequestException(EFriendRequestMessages.SEND_TO_MYSELF);
    }

    const blockCheck = await this.checkBlockedUser({
      blockerId: senderId,
      blockedId: recipientId,
    });

    const existing = await this.findSentFriendRequest(senderId, recipientId);
    let friendRequest: TGetFriendRequestsData;

    if (existing) {
      // Nếu yêu cầu đã tồn tại và ở trạng thái PENDING hoặc ACCEPTED, báo lỗi
      if (
        existing.status === EFriendRequestStatus.PENDING ||
        existing.status === EFriendRequestStatus.ACCEPTED
      ) {
        throw new BadRequestException(
          EFriendRequestMessages.INVITATION_SENT_BEFORE,
        );
      }

      // Cập nhật yêu cầu kết bạn hiện có (ví dụ: từ REJECTED sang PENDING)
      friendRequest = await this.update(
        existing.id,
        senderId,
        recipientId,
        EFriendRequestStatus.PENDING,
        {
          include: {
            Sender: {
              include: {
                Profile: true,
              },
            },
            Recipient: {
              include: {
                Profile: true,
              },
            },
          },
        },
      );
    } else {
      friendRequest = await this.create<TGetFriendRequestsData>(
        senderId,
        recipientId,
        {
          include: {
            Sender: {
              include: {
                Profile: true,
              },
            },
            Recipient: {
              include: {
                Profile: true,
              },
            },
          },
        },
      );
    }

    if (!friendRequest) {
      throw new BadRequestException(
        EFriendRequestMessages.FRIEND_REQUEST_NOT_FOUND,
      );
    }

    try {
      await this.userConnectionService.sendFriendRequest(
        friendRequest.Sender,
        recipientId,
        friendRequest,
      );
    } catch (error) {
      console.error('Failed to send friend request notification:', error);
    }

    return friendRequest;
  }

  async friendRequestAction(
    friendRequestPayload: FriendRequestActionDTO,
  ): Promise<void> {
    const { requestId, action, senderId } = friendRequestPayload;
    switch (action) {
      case EFriendRequestStatus.ACCEPTED:
        await this.PrismaService.$transaction(async (tx) => {
          const friendRequest = await this.PrismaService.friendRequest.update({
            where: {
              id: requestId,
            },
            data: {
              status: EFriendRequestStatus.ACCEPTED,
            },
          });
          await this.PrismaService.friend.create({
            data: {
              recipientId: friendRequest.recipientId,
              senderId: friendRequest.senderId,
            },
          });
        });
        break;
      case EFriendRequestStatus.REJECTED:
        await this.PrismaService.friendRequest.update({
          where: {
            id: requestId,
          },
          data: {
            status: EFriendRequestStatus.REJECTED,
          },
        });
        break;
    }
    this.userConnectionService.friendRequestAction(senderId, requestId, action);
  }

  async getFriendRequests(
    getFriendRequestsPayload: GetFriendRequestsDTO,
  ): Promise<TGetFriendRequestsData[]> {
    const { lastFriendRequestId, limit, userId } = getFriendRequestsPayload;
    let cursor: TSignatureObject = {};
    if (lastFriendRequestId) {
      cursor = {
        skip: 1,
        cursor: {
          id: lastFriendRequestId,
        },
      };
    }
    return await this.PrismaService.friendRequest.findMany({
      take: limit,
      ...cursor,
      where: {
        OR: [{ recipientId: userId }, { senderId: userId }],
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        Sender: {
          include: {
            Profile: true,
          },
        },
        Recipient: {
          include: {
            Profile: true,
          },
        },
      },
    });
  }
}
