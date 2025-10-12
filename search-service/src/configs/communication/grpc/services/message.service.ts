import type { TMessageForGlobalSearch } from '@/utils/entities/message.entity'
import type { MessageService as MessageServiceType } from 'protos/generated/conversation'
import { firstValueFrom } from 'rxjs'

export class MessageService {
  constructor(private instance: MessageServiceType) {}

  async findMessagesForGlobalSearch(
    ids: number[],
    limit: number
  ): Promise<TMessageForGlobalSearch[]> {
    const messagesJson = (
      await firstValueFrom(
        this.instance.FindMessagesForGlobalSearch({
          ids,
          limit,
        })
      )
    ).messagesJson
    return messagesJson.map((messageJson) => JSON.parse(messageJson) as TMessageForGlobalSearch)
  }
}
