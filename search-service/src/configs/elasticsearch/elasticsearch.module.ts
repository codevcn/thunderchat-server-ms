import { Module } from '@nestjs/common'
import { ElasticsearchService } from './elasticsearch.service'
import { ElasticSearchGrpcController } from './elasticsearch-grpc.controller'
import { SyncDataToESService } from './sync-data-to-ES/sync-data-to-es.service'
import { ESMessageEncryptionService } from './es-message-encryption.service'
import { GrpcClientModule } from '../communication/grpc/grpc-client.module'

@Module({
  imports: [GrpcClientModule],
  controllers: [ElasticSearchGrpcController],
  providers: [ElasticsearchService, SyncDataToESService, ESMessageEncryptionService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
