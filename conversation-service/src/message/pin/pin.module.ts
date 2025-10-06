import { Module } from '@nestjs/common'
import { PinService } from './pin.service'
import { PinController } from './pin.controller'
import { PrismaModule } from '../../configs/db/prisma.module'
import { GroupChatModule } from '@/group-chat/group-chat.module'
import { GroupMemberModule } from '@/group-member/group-member.module'

@Module({
  imports: [PrismaModule, GroupChatModule, GroupMemberModule],
  providers: [PinService],
  controllers: [PinController],
  exports: [PinService],
})
export class PinModule {}
