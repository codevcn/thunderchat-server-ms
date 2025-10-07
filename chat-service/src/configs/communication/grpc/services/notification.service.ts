import type {
  TPushNotificationData,
  TWebPushSendNotificationResult,
} from '@/configs/push-notification/push-notification.type'
import type { TUserId } from '@/user/user.type'
import { TCastedFieldObject } from '@/utils/types'
import type {
  NotificationService as NotificationServiceType,
  SendNotificationToUserResponse,
} from 'protos/generated/notification'

export class PushNotificationService {
  constructor(private instance: NotificationServiceType) {}

  async sendNotificationToUser(
    payload: TPushNotificationData,
    userId: TUserId
  ): Promise<TWebPushSendNotificationResult> {
    return (
      (await this.instance.SendNotificationToUser({
        userId,
        payload,
      })) as TCastedFieldObject<
        SendNotificationToUserResponse,
        'result',
        TWebPushSendNotificationResult
      >
    ).result
  }
}
