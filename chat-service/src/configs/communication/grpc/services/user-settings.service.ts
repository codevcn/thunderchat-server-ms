import { TUserSettings } from '@/utils/entities/user.entity'
import { TCastedFieldObject } from '@/utils/types'
import {
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
