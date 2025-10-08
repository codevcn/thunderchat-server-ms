import type { TDirectChat } from '@/utils/entities/direct-chat.entity'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  CreateNewDirectChatResponse,
  DirectChatService as DirectChatServiceType,
  FindConversationWithOtherUserResponse,
  FindDirectChatByIdResponse,
} from 'protos/generated/conversation'

export class DirectChatService {
  constructor(private instance: DirectChatServiceType) {}

  async findConversationWithOtherUser(
    userId: number,
    otherUserId: number
  ): Promise<TDirectChat | null> {
    return (
      (
        (await this.instance.FindConversationWithOtherUser({
          userId,
          otherUserId,
        })) as TCastedFieldObject<
          FindConversationWithOtherUserResponse,
          'directChat',
          TDirectChat | undefined
        >
      ).directChat || null
    )
  }

  async createNewDirectChat(creatorId: number, recipientId: number): Promise<TDirectChat> {
    return (
      (await this.instance.CreateNewDirectChat({
        creatorId,
        recipientId,
      })) as TCastedFieldObject<CreateNewDirectChatResponse, 'newDirectChat', TDirectChat>
    ).newDirectChat
  }

  async updateLastSentMessage(directChatId: number, lastSentMessageId: number): Promise<void> {
    await this.instance.UpdateLastSentMessage({
      directChatId,
      lastSentMessageId,
    })
  }

  async findById(directChatId: number): Promise<TDirectChat | null> {
    return (
      (
        (await this.instance.findById({ directChatId })) as TCastedFieldObject<
          FindDirectChatByIdResponse,
          'directChat',
          TDirectChat | undefined
        >
      ).directChat || null
    )
  }
}
