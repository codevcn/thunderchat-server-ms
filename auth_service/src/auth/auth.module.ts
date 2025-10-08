import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JWTService } from '@/auth/jwt/jwt.service';
import { CredentialService } from './credentials/credentials.service';

import { AdminRoleModule } from './role/admin/admin.module';
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
@Module({
  imports: [AdminRoleModule, GrpcClientModule],
  controllers: [AuthController],
  providers: [AuthService, JWTService, JwtService, CredentialService],
  exports: [AuthService, JWTService, CredentialService],
})
export class AuthModule {}
