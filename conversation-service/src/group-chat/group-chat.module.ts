import { Module } from '@nestjs/common'
import { GroupChatController } from './group-chat.controller'
import { GroupChatService } from './group-chat.service'
import { InviteCodeService } from './invite-code.service'
import { JoinRequestsService } from './join-requests.service'
import { GroupMemberService } from '@/group-member/group-member.service'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'

@Module({
  imports: [GrpcClientModule],
  controllers: [GroupChatController],
  providers: [GroupChatService, GroupMemberService, InviteCodeService, JoinRequestsService],
  exports: [GroupChatService, GroupMemberService, InviteCodeService, JoinRequestsService],
})
export class GroupChatModule {}
