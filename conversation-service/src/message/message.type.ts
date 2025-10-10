import type {
  TMessage,
  TMessageForGlobalSearch,
  TMessageFullInfo,
} from '@/utils/entities/message.entity'
import type { EMessageStatus } from '@/utils/enums'
import type { EMessageTypes } from '@/message/message.enum'
import {
  CreateNewMessageRequest,
  CreateNewMessageResponse,
  FindMessagesForGlobalSearchRequest,
  FindMessagesForGlobalSearchResponse,
  UpdateMessageStatusRequest,
  UpdateMessageStatusResponse,
} from 'protos/generated/conversation'
import { TCastedFields } from '@/utils/types'

export type TNewGroupMessage = {
  id: number
  content: string
  authorId: number
  directChatId: number
  createdAt: Date
}

export type TGetDirectMessagesData = {
  hasMoreMessages: boolean
  directMessages: TGetDirectMessagesMessage[]
}

export type TMsgStatusPayload = {
  messageId: number
  status: EMessageStatus
}

export type TMessageOffset = TMessage['id']

export type TMessageUpdates = Partial<Omit<TMessage, 'id' | 'createdAt' | 'updatedAt' | 'content'>>

export type TSendMessageDto = {
  content?: string
  type: EMessageTypes
  mediaUrl?: string
}

export type TGetDirectMessagesMessage = TMessageFullInfo

export type TFindMessagesForGlobalSearchPayload = FindMessagesForGlobalSearchRequest

// gRPC Types
export type TGetNewerDirectMessagesRequest = {
  messageOffset: number
  directChatId?: number
  groupChatId?: number
  limit: number
}

export type TGetNewerDirectMessagesResponse = {
  messages: any[]
}

export type TCreateNewMessageRequest = TCastedFields<
  CreateNewMessageRequest,
  { type: EMessageTypes }
>

export type TCreateNewMessageResponse = TCastedFields<
  CreateNewMessageResponse,
  { newMessage: TGetDirectMessagesMessage }
>

export type TUpdateMessageStatusRequest = TCastedFields<
  UpdateMessageStatusRequest,
  { status: EMessageStatus }
>

export type TUpdateMessageStatusResponse = TCastedFields<
  UpdateMessageStatusResponse,
  { message: TMessage }
>

export type TFindMessagesForGlobalSearchRequest = FindMessagesForGlobalSearchRequest

export type TFindMessagesForGlobalSearchResponse = TCastedFields<
  FindMessagesForGlobalSearchResponse,
  { messages: TMessageForGlobalSearch[] }
>
