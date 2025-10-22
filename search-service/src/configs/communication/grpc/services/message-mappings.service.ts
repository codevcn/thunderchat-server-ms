import type { TMessageMappings } from '@/utils/entities/message-mappings.entity'
import type { MessageMappingsService as MessageMappingsServiceType } from 'protos/generated/conversation'
import { firstValueFrom } from 'rxjs'

export class MessageMappingsService {
  constructor(private instance: MessageMappingsServiceType) {}

  async createMessageMappings(mappings: string, encryptionKey: string): Promise<TMessageMappings> {
    return JSON.parse(
      (await firstValueFrom(this.instance.CreateMessageMappings({ mappings, encryptionKey })))
        .messageMappingsJson
    )
  }

  async getMessageMappings(): Promise<TMessageMappings | null> {
    const { messageMappingsJson } = await firstValueFrom(this.instance.GetMessageMappings({}))
    return messageMappingsJson ? JSON.parse(messageMappingsJson) : null
  }

  async updateMessageMappings(mappings: string, encryptionKeyIfCreate?: string): Promise<void> {
    return JSON.parse(
      (
        await firstValueFrom(
          this.instance.UpdateMessageMappings({ mappings, encryptionKeyIfCreate })
        )
      ).messageMappingsJson
    )
  }
}
