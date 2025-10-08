import { TUserSettings } from '@/utils/entities/user.entity';

export interface IUserSettings {
  id: number;
  userId: number;
  onlyReceiveFriendMessage: boolean;
}

export interface IUserGrpcSettingController {
  FindByUserId(data: {
    userId: number;
  }): Promise<{ userSettings: IUserSettings }>;
}
