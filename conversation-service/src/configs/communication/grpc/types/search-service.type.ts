import type { Empty } from 'protos/generated/google/protobuf/empty'
import type { DataToSync, ElasticSearchService } from 'protos/generated/search'

export interface IElasticSearchService extends ElasticSearchService {
  SyncDataToES(request: DataToSync): Promise<Empty>
}
