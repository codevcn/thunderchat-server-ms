import { Module } from '@nestjs/common'
import { AuthController } from '@/auth/auth.controller'
import { AuthService } from '@/auth/auth.service'
import { JWTService } from '@/auth/jwt/jwt.service'
import { CredentialService } from './credentials/credentials.service'
import { AdminRoleModule } from './role/admin/admin.module'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'
import { AuthGrpcController } from './auth-grpc.controller'

@Module({
  imports: [AdminRoleModule, GrpcClientModule],
  controllers: [AuthController, AuthGrpcController],
  providers: [AuthService, JWTService, CredentialService],
  exports: [AuthService, JWTService, CredentialService],
})
export class AuthModule {}
