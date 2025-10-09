import { Module } from '@nestjs/common';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module';
@Module({
  imports: [GrpcClientModule],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
})
export class FriendRequestModule {}
