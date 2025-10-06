import { Module } from '@nestjs/common'
import { GroupMemberController } from './group-member.controller'
import { GroupMemberService } from './group-member.service'

@Module({
  providers: [GroupMemberService],
  controllers: [GroupMemberController],
  exports: [GroupMemberService],
})
export class GroupMemberModule {}
