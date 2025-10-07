import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module';

@Module({
  imports: [GrpcClientModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
