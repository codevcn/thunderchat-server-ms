import type { NextFunction } from 'express'
import type { Socket } from 'socket.io'
import type { TGroupChat } from '@/utils/entities/group-chat.entity'
import type {
  CheckUserIsOnlineRequest,
  EmitToDirectChatRequest,
  FriendRequestActionRequest,
  RemoveConnectedClientRequest,
  SendFriendRq,
  SendNewMessageToGroupChatRequest,
} from 'protos/generated/chat'

export type TServerMiddleware = (socket: Socket, next: NextFunction) => void

export type TCreateGroupChatRoomNameHandler = (groupChatId: TGroupChat['id']) => string

export type TSocketId = Socket['id']

export type TSendFriendRequestPayload = SendFriendRq

export type TRemoveConnectedClientRequest = RemoveConnectedClientRequest

export type TCheckUserIsOnlineRequest = CheckUserIsOnlineRequest

export type TFriendRequestActionPayload = FriendRequestActionRequest

export type TGetConnectedClientsCountForAdminResponse = { count: number }

export type TEmitToDirectChatPayload = EmitToDirectChatRequest

export type TSendNewMessageToGroupChatPayload = SendNewMessageToGroupChatRequest
