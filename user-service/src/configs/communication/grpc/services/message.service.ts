import type { MessageMappingsService as MessageMappingsServiceType } from 'protos/generated/conversation'
import { firstValueFrom } from 'rxjs'

export class MessageMappingsService {
  constructor(private instance: MessageMappingsServiceType) {}

  async createMessageMappings(userId: number): Promise<void> {
    await firstValueFrom(this.instance.CreateMessageMappings({ userId }))
  }
}
