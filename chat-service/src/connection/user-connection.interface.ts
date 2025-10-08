import type {
  TCheckUserIsOnlineRequest,
  TFriendRequestActionPayload,
  TRemoveConnectedClientRequest,
  TSendFriendRequestPayload,
} from './user-connection.type'
import type { CheckUserIsOnlineResponse } from 'protos/generated/chat'

export interface IUserConnectionGrpcController {
  sendFriendRequest(data: TSendFriendRequestPayload): Promise<void>
  removeConnectedClient(data: TRemoveConnectedClientRequest): Promise<void>
  checkUserIsOnline(data: TCheckUserIsOnlineRequest): Promise<CheckUserIsOnlineResponse>
  friendRequestAction(data: TFriendRequestActionPayload): Promise<void>
}
