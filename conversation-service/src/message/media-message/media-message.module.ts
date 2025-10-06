import { Module } from '@nestjs/common'
import { MediaMessageController } from './media-message.controller'
import { MediaMessageService } from './media-message.service'

@Module({
  providers: [MediaMessageService],
  controllers: [MediaMessageController],
  exports: [MediaMessageService],
})
export class MediaMessageModule {}
