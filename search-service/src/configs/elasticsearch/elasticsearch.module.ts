import { Module } from '@nestjs/common'
import { ElasticsearchService } from './elasticsearch.service'
import { ElasticSearchGrpcController } from './elasticsearch-grpc.controller'
import { SyncDataToESModule } from './sync-data-to-ES/sync-data-to-ES.module'
import { SyncDataToESService } from './sync-data-to-ES/sync-data-to-es.service'

@Module({
  imports: [SyncDataToESModule],
  controllers: [ElasticSearchGrpcController],
  providers: [ElasticsearchService, SyncDataToESService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
