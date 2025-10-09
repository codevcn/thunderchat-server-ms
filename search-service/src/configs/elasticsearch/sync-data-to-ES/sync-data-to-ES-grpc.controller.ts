import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SyncDataToESService } from './sync-data-to-es.service';
import { SyncDataToESWorkerMessageDTO } from './sync-data-to-ES.dto';
import { ESyncDataToESWorkerType } from '@/utils/enums';

interface IElasticSearchGrpcController {
  SyncDataToES(data: SyncDataToESWorkerMessageDTO): Promise<{}>;
}

@Controller()
export class ElasticSearchGrpcController
  implements IElasticSearchGrpcController
{
  constructor(private readonly syncDataToESService: SyncDataToESService) {}

  @GrpcMethod('ElasticSearchService', 'SyncDataToES')
  async SyncDataToES(data: SyncDataToESWorkerMessageDTO): Promise<{}> {
    this.syncDataToESService.syncDataToES(data);
    return {};
  }
}
