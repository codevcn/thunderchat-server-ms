import type {
  TGroupChatMemberWithUser,
  TGroupChatMemberWithUserAndGroupChat,
} from '@/utils/entities/group-chat-member.entity'
import { TCastedFields } from '@/utils/types'
import {
  FindGroupChatMemberIdsRequest,
  FindGroupChatMemberIdsResponse,
  FindMemberInGroupChatRequest,
  FindMemberInGroupChatResponse,
} from 'protos/generated/conversation'

export type TAddMembersToGroupChatRes = {
  addedMembers: TGroupChatMemberWithUser[]
}

// gRPC Types
export type TFindMemberInGroupChatRequest = FindMemberInGroupChatRequest

export type TFindMemberInGroupChatResponse = TCastedFields<
  FindMemberInGroupChatResponse,
  { groupChatMember: TGroupChatMemberWithUserAndGroupChat | null }
>

export type TFindGroupChatMemberIdsRequest = FindGroupChatMemberIdsRequest

export type TFindGroupChatMemberIdsResponse = FindGroupChatMemberIdsResponse
