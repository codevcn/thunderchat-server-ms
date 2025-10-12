import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { UserConnectionService as UserConnectionServiceType } from '../../../../../protos/generated/chat'
import type { TGetFriendRequestsData } from '@/friend-request/friend-request.type'
import { firstValueFrom } from 'rxjs'

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async sendFriendRequest(
    sender: TUserWithProfile,
    recipientId: number,
    requestData: TGetFriendRequestsData
  ): Promise<void> {
    await firstValueFrom(
      this.instance.SendFriendRequest({
        senderJson: JSON.stringify(sender),
        recipientId,
        requestDataJson: JSON.stringify(requestData),
      })
    )
  }

  async friendRequestAction(senderId: number, requestId: number, action: string): Promise<void> {
    await firstValueFrom(
      this.instance.FriendRequestAction({
        senderId,
        requestId,
        action,
      })
    )
  }
}
