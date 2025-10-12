import type { UserConnectionService as UserConnectionServiceType } from '../../../../../protos/generated/chat'
import type { TUserId } from '@/user/user.type'
import type { TSocketId } from '@/connection/user-connection.type'
import { firstValueFrom } from 'rxjs'

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async removeConnectedClient(userId: TUserId, socketId?: TSocketId): Promise<void> {
    await firstValueFrom(this.instance.RemoveConnectedClient({ userId, socketId }))
  }
}
