import type { TCastedFieldObject } from '@/utils/types'
import type { FriendService as FriendServiceType, IsFriendResponse } from 'protos/generated/friend'

export class FriendService {
  constructor(private instance: FriendServiceType) {}

  async isFriend(userId: number, friendId: number): Promise<boolean> {
    return (
      (await this.instance.IsFriend({ friendId, userId })) as TCastedFieldObject<
        IsFriendResponse,
        'isFriend',
        boolean
      >
    ).isFriend
  }
}
