import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { PushNotificationService } from './push-notification.service'
import type { TPushNotificationData } from './push-notification.type'
import type { IPushNotificationGrpcController } from './push-notification.interface'
import { EGrpcPackages } from '@/utils/enums'
import { SendNotificationToUserRequest } from 'protos/generated/notification'

@Controller()
export class PushNotificationGrpcController implements IPushNotificationGrpcController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @GrpcMethod(EGrpcPackages.NOTIFICATION_PACKAGE, 'SendNotificationToUser')
  async SendNotificationToUser(data: SendNotificationToUserRequest) {
    const notificationResult = await this.pushNotificationService.sendNotificationToUser(
      JSON.parse(data.payloadJson) as TPushNotificationData,
      data.userId
    )
    return { resultJson: JSON.stringify(notificationResult) }
  }
}
