import type { ElasticSearchService as ElasticSearchServiceType } from 'protos/generated/search'
import { firstValueFrom } from 'rxjs'

export class ElasticSearchService {
  constructor(private instance: ElasticSearchServiceType) {}

  async initESMessageEncryptorByUser(userId: number): Promise<void> {
    await firstValueFrom(this.instance.InitESMessageEncryptorByUser({ userId }))
  }
}
