import type { TUserWithProfile } from '@/utils/entities/user.entity';

import type { UserConnectionService as UserConnectionServiceType } from '../../../../../protos/generated/chat';
import { TGetFriendRequestsData } from '@/friend-request/friend-request.type';
import { TUserId } from '@/user/user.type';
import { TSocketId } from '@/connection/user-connection.type';

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async removeConnectedClient(
    userId: TUserId,
    socketId?: TSocketId,
  ): Promise<void> {
    await this.instance.RemoveConnectedClient({ userId, socketId });
  }
}
