import type { UserConnectionService as UserConnectionServiceType } from 'protos/generated/chat'
import { firstValueFrom } from 'rxjs'
import type { UpdateProfileDto } from '@/profile/profile.dto'

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async updateUserInfo(userId: number, updates: UpdateProfileDto): Promise<void> {
    await firstValueFrom(
      this.instance.UpdateUserInfo({
        userId,
        updatesJson: JSON.stringify(updates),
      })
    )
  }
}
