import type { TUserSettings } from '@/utils/entities/user.entity'

export type UserSettingsResponse = TUserSettings | null

export type TFindUserSettingsByUserIdGrpcRes = {
  userSettings: TUserSettings | null
}
