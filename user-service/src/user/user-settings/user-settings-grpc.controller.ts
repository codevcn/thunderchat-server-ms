import { EGrpcServices } from '@/utils/enums'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { FindByUserIdRequest } from 'protos/generated/user'
import type { IUserSettingsGrpcController } from './user-settings.interface'
import { UserSettingsService } from './user-settings.service'

@Controller()
export class UserSettingsGrpcController implements IUserSettingsGrpcController {
  constructor(private userSettingsService: UserSettingsService) {}

  @GrpcMethod(EGrpcServices.USER_SETTINGS_SERVICE, 'FindByUserId')
  async FindByUserId(data: FindByUserIdRequest) {
    const userSettings = await this.userSettingsService.findByUserId(data.userId)
    return {
      userSettingsJson: userSettings ? JSON.stringify(userSettings) : null,
    }
  }
}
