import { EMessagingEmitSocketEvents } from '@/utils/events/socket.event'
import type { UserConnectionService as UserConnectionServiceType } from 'protos/generated/chat'
import { createAnyFromObject } from '../grpc-client.helper'
import type { TMessageFullInfo } from '@/utils/entities/message.entity'
import type { TGroupChat } from '@/utils/entities/group-chat.entity'
import { firstValueFrom } from 'rxjs'

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async getConnectedClientsCountForAdmin(): Promise<number> {
    return (await firstValueFrom(this.instance.GetConnectedClientsCountForAdmin({}))).count
  }

  async emitToDirectChat(
    directChatId: number,
    event: EMessagingEmitSocketEvents,
    payload: any
  ): Promise<void> {
    await firstValueFrom(
      this.instance.EmitToDirectChat({
        directChatId,
        event,
        payload: createAnyFromObject(payload),
      })
    )
  }

  async sendNewMessageToGroupChat(
    groupChatId: TGroupChat['id'],
    newMessage: TMessageFullInfo
  ): Promise<void> {
    await firstValueFrom(
      this.instance.SendNewMessageToGroupChat({
        groupChatId,
        newMessageJson: JSON.stringify(newMessage),
      })
    )
  }
}
