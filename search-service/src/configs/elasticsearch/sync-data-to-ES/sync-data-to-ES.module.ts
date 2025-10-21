import { Module } from '@nestjs/common'
import { SyncDataToESService } from './sync-data-to-ES.service'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'

@Module({
  imports: [GrpcClientModule],
  providers: [SyncDataToESService],
  exports: [SyncDataToESService],
})
export class SyncDataToESModule {}
