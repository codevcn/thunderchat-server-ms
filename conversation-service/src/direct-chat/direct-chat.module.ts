import { DirectChatController } from '@/direct-chat/direct-chat.controller'
import { DirectChatService } from './direct-chat.service'
import { Module } from '@nestjs/common'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'
import { DirectChatGrpcController } from './direct-chat-grpc.controller'

@Module({
  imports: [GrpcClientModule],
  controllers: [DirectChatController, DirectChatGrpcController],
  providers: [DirectChatService],
  exports: [DirectChatService],
})
export class DirectChatsModule {}
