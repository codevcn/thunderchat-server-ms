import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JWTService } from './jwt/jwt.service';
import { CredentialService } from './credentials/credentials.service';
import { UserModule } from '@/user/user.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from '@/app.module';

@Module({
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
