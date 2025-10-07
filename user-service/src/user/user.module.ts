import { Module } from '@nestjs/common';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';
import { BlockUserService } from '@/user/block-user.service';
import { CredentialService } from '@/auth/credentials/credentials.service';

import { BlockUserGrpcController } from './grpc/block-user.grpc.controller';
import { UserGrpcController } from './grpc/user.grpc.controller';
@Module({
  controllers: [UserController, BlockUserGrpcController, UserGrpcController],
  providers: [UserService, CredentialService, BlockUserService],
  exports: [UserService, CredentialService, BlockUserService],
})
export class UserModule {}
