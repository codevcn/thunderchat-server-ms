import { DirectChatController } from '@/direct-chat/direct-chat.controller'
import { DirectChatService } from './direct-chat.service'
import { Module } from '@nestjs/common'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'

@Module({
  imports: [GrpcClientModule],
  controllers: [DirectChatController],
  providers: [DirectChatService],
  exports: [DirectChatService],
})
export class DirectChatsModule {}
