import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PushNotificationService } from './push-notification.service';
import {
  TPushNotificationData,
  TWebPushSendNotificationResult,
} from './push-notification.type';
import { TUserId } from '@/user/user.type';
import { IPushNotificationGrpcController } from './push-notification.interface';

@Controller()
export class PushNotificationGrpcController
  implements IPushNotificationGrpcController
{
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @GrpcMethod('NotificationService', 'SendNotificationToUser')
  async SendNotificationToUser(data: {
    payload: TPushNotificationData;
    userId: TUserId;
  }): Promise<TWebPushSendNotificationResult> {
    const notificationResult =
      await this.pushNotificationService.sendNotificationToUser(
        data.payload,
        data.userId,
      );

    return notificationResult;
  }
}
