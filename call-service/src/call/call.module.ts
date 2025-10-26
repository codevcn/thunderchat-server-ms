import { Module } from '@nestjs/common'
import { CallGateway } from './call.gateway'
import { CallService } from './call.service'
import { CallConnectionService } from '@/connection/call-connection.service'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'

@Module({
  imports: [GrpcClientModule],
  providers: [CallGateway, CallService, CallConnectionService],
})
export class CallGatewayModule {}
