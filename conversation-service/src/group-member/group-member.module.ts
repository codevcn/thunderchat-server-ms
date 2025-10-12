import { Module } from '@nestjs/common'
import { GroupMemberController } from './group-member.controller'
import { GroupMemberService } from './group-member.service'
import { GroupMemberGrpcController } from './group-member-grpc.controller'

@Module({
  providers: [GroupMemberService],
  controllers: [GroupMemberController, GroupMemberGrpcController],
  exports: [GroupMemberService],
})
export class GroupMemberModule {}
