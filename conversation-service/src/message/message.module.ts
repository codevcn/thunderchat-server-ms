import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'
import { MessageController } from '@/message/message.controller'
import { MessageService } from '@/message/message.service'
import { Module } from '@nestjs/common'
import { MessageGrpcController } from './message-grpc.controller'

@Module({
  imports: [GrpcClientModule],
  providers: [MessageService],
  controllers: [MessageController, MessageGrpcController],
  exports: [MessageService],
})
export class MessageModule {}
