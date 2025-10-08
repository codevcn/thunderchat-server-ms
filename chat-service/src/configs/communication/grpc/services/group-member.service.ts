import type { TGroupChatMemberWithUserAndGroupChat } from '@/utils/entities/group-chat-member.entity'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  FindGroupChatMemberIdsResponse,
  FindMemberInGroupChatResponse,
  GroupMemberService as GroupMemberServiceType,
} from 'protos/generated/conversation'

export class GroupMemberService {
  constructor(private instance: GroupMemberServiceType) {}

  async findMemberInGroupChat(groupChatId: number, userId: number): Promise<any | null> {
    return (
      (
        (await this.instance.FindMemberInGroupChat({ groupChatId, userId })) as TCastedFieldObject<
          FindMemberInGroupChatResponse,
          'groupChatMember',
          TGroupChatMemberWithUserAndGroupChat | undefined
        >
      ).groupChatMember || null
    )
  }

  async findGroupChatMemberIds(groupChatId: number): Promise<number[]> {
    return (
      (await this.instance.FindGroupChatMemberIds({ groupChatId })) as TCastedFieldObject<
        FindGroupChatMemberIdsResponse,
        'memberIds',
        number[]
      >
    ).memberIds
  }
}
