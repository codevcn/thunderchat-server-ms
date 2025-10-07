import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JWTService } from '@/auth/jwt/jwt.service';
import { CredentialService } from './credentials/credentials.service';

import { AdminRoleModule } from './role/admin/admin.module';
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module';
import { UserModule } from '@/user/user.module';
@Module({
  imports: [AdminRoleModule, GrpcClientModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, CredentialService],
  exports: [AuthService, CredentialService],
})
export class AuthModule {}
