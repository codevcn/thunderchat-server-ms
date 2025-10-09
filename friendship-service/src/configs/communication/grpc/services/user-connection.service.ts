import type { TUserWithProfile } from '@/utils/entities/user.entity';

import type { UserConnectionService as UserConnectionServiceType } from '../../../../../protos/generated/chat';
import { TGetFriendRequestsData } from '@/friend-request/friend-request.type';
import { FriendRequestActionDTO } from '@/friend-request/friend-request.dto';

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async sendFriendRequest(
    sender: TUserWithProfile,
    recipientId: number,
    requestData: TGetFriendRequestsData,
  ): Promise<void> {
    await this.instance.SendFriendRequest({
      sender,
      recipientId,
      requestData,
    });
  }

  async friendRequestAction(
    senderId: number,
    requestId: number,
    action: string,
  ): Promise<void> {
    await this.instance.FriendRequestAction({
      senderId,
      requestId,
      action,
    });
  }
}
