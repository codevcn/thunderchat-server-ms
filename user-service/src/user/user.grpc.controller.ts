import { Controller, Get, Query } from '@nestjs/common';

import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { BlockUserService } from './block-user.service';
import {
  IBlockUserGrpcController,
  IUserGrpcController,
} from './user.interface';

@Controller()
export class UserGrpcController implements IUserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'FindUserWithProfileById')
  async FindUserWithProfileById(data: { userId: number }) {
    const user = await this.userService.findUserWithProfileById(data.userId);
    return { user };
  }
}

@Controller()
export class BlockUserGrpcController implements IBlockUserGrpcController {
  constructor(private readonly blockUserService: BlockUserService) {}

  @GrpcMethod('UserService', 'CheckBlockedUser')
  async CheckBlockedUser(data: { blockerId: number; blockedId: number }) {
    const blockUser = await this.blockUserService.checkBlockedUser(
      data.blockerId,
      data.blockedId,
    );
    return { blockUser };
  }
}
