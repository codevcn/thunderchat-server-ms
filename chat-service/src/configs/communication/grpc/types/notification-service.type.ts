import type {
  NotificationService,
  SendNotificationToUserRequest,
  SendNotificationToUserResponse,
} from 'protos/generated/notification'

export interface INotificationService extends NotificationService {
  SendNotificationToUser(
    request: SendNotificationToUserRequest
  ): Promise<SendNotificationToUserResponse>
}
