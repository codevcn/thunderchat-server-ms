import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@/configs/elasticsearch/elasticsearch.module';
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module';

@Module({
  imports: [ElasticsearchModule, GrpcClientModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
