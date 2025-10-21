import { TMessageMappings } from '@/utils/entities/message-mappings.entity'
import type { MessageMappingsService as MessageMappingsServiceType } from 'protos/generated/conversation'
import { firstValueFrom } from 'rxjs'

export class MessageMappingsService {
  constructor(private instance: MessageMappingsServiceType) {}

  async findMessageMappings(userId: number): Promise<TMessageMappings | null> {
    const { messageMappingsJson } = await firstValueFrom(this.instance.FindByUserId({ userId }))
    return messageMappingsJson ? JSON.parse(messageMappingsJson) : null
  }
}
