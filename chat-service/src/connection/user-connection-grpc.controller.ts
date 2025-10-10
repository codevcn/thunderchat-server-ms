import { EGrpcServices } from '@/utils/enums'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import type {
  TCheckUserIsOnlineRequest,
  TEmitToDirectChatPayload,
  TFriendRequestActionPayload,
  TRemoveConnectedClientRequest,
  TSendFriendRequestPayload,
  TSendNewMessageToGroupChatPayload,
} from './user-connection.type'
import type { IUserConnectionGrpcController } from './user-connection.interface'
import { UserConnectionService } from './user-connection.service'

@Controller()
export class UserConnectionGrpcController implements IUserConnectionGrpcController {
  constructor(private userConnectionService: UserConnectionService) {}

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'SendFriendRequest')
  async sendFriendRequest(data: TSendFriendRequestPayload) {
    this.userConnectionService.sendFriendRequest(data.sender, data.recipientId, data.requestData)
  }

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'RemoveConnectedClient')
  async removeConnectedClient(data: TRemoveConnectedClientRequest) {
    this.userConnectionService.removeConnectedClient(data.userId, data.socketId)
  }

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'CheckUserIsOnline')
  async checkUserIsOnline(data: TCheckUserIsOnlineRequest) {
    const isOnline = this.userConnectionService.checkUserIsOnline(data.userId)
    return { isOnline }
  }

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'FriendRequestAction')
  async friendRequestAction(data: TFriendRequestActionPayload) {
    this.userConnectionService.friendRequestAction(data.senderId, data.requestId, data.action)
  }

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'GetConnectedClientsCountForAdmin')
  async getConnectedClientsCountForAdmin() {
    const count = this.userConnectionService.getConnectedClientsCountForAdmin()
    return { count }
  }

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'EmitToDirectChat')
  async emitToDirectChat(data: TEmitToDirectChatPayload) {
    await this.userConnectionService.emitToDirectChat(data.directChatId, data.event, data.payload)
  }

  @GrpcMethod(EGrpcServices.USER_CONNECTION_SERVICE, 'SendNewMessageToGroupChat')
  async sendNewMessageToGroupChat(data: TSendNewMessageToGroupChatPayload) {
    this.userConnectionService.sendNewMessageToGroupChat(data.groupChatId, data.newMessage)
  }
}
