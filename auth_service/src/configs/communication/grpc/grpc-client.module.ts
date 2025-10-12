import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { GrpcClientConfig } from './grpc-client.config'

@Module({
  imports: [
    ClientsModule.registerAsync([
      GrpcClientConfig.getUserConnectionClient(),
      GrpcClientConfig.getUserClient(),
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientModule {}
