import type { NextFunction } from 'express'
import type { Socket } from 'socket.io'
import type { TGroupChat } from '@/utils/entities/group-chat.entity'
import type { TCastedFields } from '@/utils/types'
import type {
  CheckUserIsOnlineRequest,
  FriendRequestActionRequest,
  RemoveConnectedClientRequest,
  SendFriendRq,
} from 'protos/generated/chat'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { TGetFriendRequestsData } from '@/friend-request/friend-request.type'
import type { EFriendRequestStatus } from '@/friend-request/friend-request.enum'

export type TServerMiddleware = (socket: Socket, next: NextFunction) => void

export type TCreateGroupChatRoomNameHandler = (groupChatId: TGroupChat['id']) => string

export type TSocketId = Socket['id']

export type TSendFriendRequestPayload = TCastedFields<
  SendFriendRq,
  { sender: TUserWithProfile; requestData: TGetFriendRequestsData }
>

export type TRemoveConnectedClientRequest = RemoveConnectedClientRequest

export type TCheckUserIsOnlineRequest = CheckUserIsOnlineRequest

export type TFriendRequestActionPayload = TCastedFields<
  FriendRequestActionRequest,
  { action: EFriendRequestStatus }
>
