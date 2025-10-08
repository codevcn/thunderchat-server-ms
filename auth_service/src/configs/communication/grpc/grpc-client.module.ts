import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { GrpcClientConfig } from './grpc-client.config';
import { UserConnectionService } from './services/user-connection.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientConfig.getUserConnectionClient()]),
  ],
  providers: [UserConnectionService],
  exports: [ClientsModule, UserConnectionService],
})
export class GrpcClientModule {}
