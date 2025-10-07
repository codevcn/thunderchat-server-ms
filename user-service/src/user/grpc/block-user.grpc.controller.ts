import { GrpcMethod } from '@nestjs/microservices';
import { BlockUserService } from '../block-user.service';
import { Controller } from '@nestjs/common';
@Controller()
export class BlockUserGrpcController {
  constructor(private readonly blockUserService: BlockUserService) {}

  @GrpcMethod('UserService', 'CheckBlockedUser')
  async checkBlockedUser(data: { blockerId: number; blockedId: number }) {
    const { blockerId, blockedId } = data;
    const blockedUser = await this.blockUserService.checkBlockedUser(
      blockerId,
      blockedId,
    );
    return { blockedUser };
  }
}
