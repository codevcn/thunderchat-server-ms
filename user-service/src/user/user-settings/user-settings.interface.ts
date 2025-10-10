import type { TFindUserSettingsByUserIdGrpcRes } from './user-settings.type'
import type { FindByUserIdRequest } from 'protos/generated/user'

export interface IUserSettings {
  id: number
  userId: number
  onlyReceiveFriendMessage: boolean
}

export interface IUserGrpcSettingController {
  FindByUserId(data: { userId: number }): Promise<{ userSettings: IUserSettings }>
}

export interface IUserSettingsGrpcController {
  FindByUserId: (data: FindByUserIdRequest) => Promise<TFindUserSettingsByUserIdGrpcRes>
}
