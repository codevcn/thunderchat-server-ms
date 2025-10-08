import type { TUserWithProfile } from '@/utils/entities/user.entity';

import type { UserConnectionService as UserConnectionServiceType } from '../../../../../protos/generated/chat';
import { TGetFriendRequestsData } from '@/friend-request/friend-request.type';

export class FriendRequestService {
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
}
