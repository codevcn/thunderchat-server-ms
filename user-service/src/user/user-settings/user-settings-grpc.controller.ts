import { Controller } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { GrpcMethod } from '@nestjs/microservices';
import { UpdateUserSettingsDto } from './user-settings.dto';
import { IUserGrpcController } from '../user.interface';
import { IUserGrpcSettingController } from './user-settings.interface';

@Controller()
export class userSettingsGrpcController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @GrpcMethod('UserSettingsService', 'FindByUserId')
  async FindByUserId(data: { userId: number }) {
    const userSettings = await this.userSettingsService.findByUserId(
      data.userId,
    );
    return { userSettings };
  }
}
