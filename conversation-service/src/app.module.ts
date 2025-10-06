import { Module } from '@nestjs/common'
import { DirectChatsModule } from './direct-chat/direct-chat.module'

@Module({
  imports: [DirectChatsModule],
})
export class AppModule {}
