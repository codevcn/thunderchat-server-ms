import type { TDirectChat } from '@/utils/entities/direct-chat.entity'
import type { TMessage } from '@/utils/entities/message.entity'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import { TCastedFields } from '@/utils/types'
import {
  CreateNewDirectChatRequest,
  CreateNewDirectChatResponse,
  FindConversationWithOtherUserRequest,
  FindConversationWithOtherUserResponse,
  FindDirectChatByIdRequest,
  FindDirectChatByIdResponse,
  UpdateLastSentMessageRequest,
} from 'protos/generated/conversation'

export type TSearchDirectChatParams = {
  email?: string
  creatorId: number
  nameOfUser?: string
}

export type TFindDirectChatData = TDirectChat & {
  Recipient: TUserWithProfile
  Creator: TUserWithProfile
}

export type TUpdateDirectChatData = Partial<{
  lastSentMessageId: number
}>

export type TFetchDirectChatsData = TDirectChat & {
  LastSentMessage: TMessage | null
  Recipient: TUserWithProfile
  Creator: TUserWithProfile
}

export type TDeleteDirectChatData = {
  isDeleted: boolean
}

// gRPC Types
export type TFindConversationWithOtherUserRequest = FindConversationWithOtherUserRequest

export type TFindConversationWithOtherUserResponse = TCastedFields<
  FindConversationWithOtherUserResponse,
  { directChat: TDirectChat | null }
>

export type TCreateNewDirectChatRequest = CreateNewDirectChatRequest

export type TCreateNewDirectChatResponse = TCastedFields<
  CreateNewDirectChatResponse,
  { newDirectChat: TDirectChat }
>

export type TUpdateLastSentMessageRequest = UpdateLastSentMessageRequest

export type TFindDirectChatByIdRequest = FindDirectChatByIdRequest

export type TFindDirectChatByIdResponse = TCastedFields<
  FindDirectChatByIdResponse,
  { directChat: TDirectChat | null }
>
