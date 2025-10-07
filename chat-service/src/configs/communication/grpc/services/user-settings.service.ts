import type { TUserSettings } from '@/utils/entities/user.entity'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  FindByUserIdResponse,
  UserSettingsService as UserSettingsServiceType,
} from 'protos/generated/user'

export class UserSettingsService {
  constructor(private instance: UserSettingsServiceType) {}

  async findByUserId(userId: number): Promise<TUserSettings | null> {
    return (
      (
        (await this.instance.findByUserId({ userId })) as TCastedFieldObject<
          FindByUserIdResponse,
          'userSettings',
          TUserSettings | undefined
        >
      ).userSettings || null
    )
  }
}
