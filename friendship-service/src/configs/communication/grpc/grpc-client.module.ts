import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { GrpcClientConfig } from './grpc-client.config'

@Module({
  imports: [
    ClientsModule.register([
      GrpcClientConfig.getConversationClient(),
      GrpcClientConfig.getAuthClient(),
      GrpcClientConfig.getUserClient(),
      GrpcClientConfig.getNotificationClient(),
      GrpcClientConfig.getChatClient(),
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientModule {}
