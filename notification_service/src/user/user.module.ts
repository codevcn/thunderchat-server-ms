import { Module } from '@nestjs/common';

import { JWTService } from '@/auth/jwt/jwt.service';

import { CredentialService } from '@/auth/credentials/credentials.service';

@Module({
  providers: [CredentialService],
  exports: [CredentialService],
})
export class UserModule {}
