import { Module } from '@nestjs/common'
import { UserController } from '@/user/user.controller'
import { UserService } from '@/user/user.service'
import { BlockUserService } from '@/user/block-user.service'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'
import { JWTService } from '@/configs/communication/grpc/services/jwt.service'

@Module({
  imports: [GrpcClientModule],
  controllers: [UserController],
  providers: [UserService, BlockUserService, JWTService],
  exports: [UserService, BlockUserService],
})
export class UserModule {}
