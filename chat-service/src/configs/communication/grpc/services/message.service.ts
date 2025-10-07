import { EMessageStatus, EMessageTypes } from '@/message/message.enum'
import type { TMessageOffset } from '@/message/message.type'
import type { TMessageFullInfo } from '@/utils/entities/message.entity'
import type { TMessage } from '@/utils/entities/message.entity copy'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  CreateNewMessageResponse,
  GetNewerDirectMessagesResponse,
  MessageService as MessageServiceType,
  UpdateMessageStatusResponse,
} from 'protos/generated/conversation'

export class MessageService {
  constructor(private instance: MessageServiceType) {}

  async getNewerDirectMessages(
    messageOffset: TMessageOffset,
    directChatId: number | undefined,
    groupChatId: number | undefined,
    limit: number
  ): Promise<TMessageFullInfo[]> {
    return (
      (await this.instance.GetNewerDirectMessages({
        messageOffset,
        directChatId,
        groupChatId,
        limit,
      })) as TCastedFieldObject<GetNewerDirectMessagesResponse, 'messages', TMessageFullInfo[]>
    ).messages
  }

  async createNewMessage(
    encryptedContent: string,
    authorId: number,
    timestamp: Date,
    type: EMessageTypes = EMessageTypes.TEXT,
    recipientId?: number,
    stickerId?: number,
    mediaId?: number,
    replyToId?: number,
    directChatId?: number,
    groupChatId?: number
  ): Promise<TMessageFullInfo> {
    return (
      (await this.instance.CreateNewMessage({
        encryptedContent,
        authorId,
        timestamp,
        type,
        recipientId,
        stickerId,
        mediaId,
        replyToId,
        directChatId,
        groupChatId,
      })) as TCastedFieldObject<CreateNewMessageResponse, 'newMessage', TMessageFullInfo>
    ).newMessage
  }

  async updateMessageStatus(msgId: number, status: EMessageStatus): Promise<TMessage> {
    return (
      (await this.instance.UpdateMessageStatus({
        msgId,
        status,
      })) as TCastedFieldObject<UpdateMessageStatusResponse, 'message', TMessage>
    ).message
  }
}
