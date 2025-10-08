import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'
import { MessageController } from '@/message/message.controller'
import { MessageService } from '@/message/message.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [GrpcClientModule],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
