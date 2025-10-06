import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './configs/db/prisma.service';
import { EProviderTokens, ESyncDataToESWorkerType } from '@/utils/enums';
import { JWTService } from '@/auth/jwt/jwt.service';
import { CredentialService } from '@/auth/credentials/credentials.service';
import { EAuthMessages } from '@/auth/auth.message';
import { TUser, TUserWithProfile } from '@/utils/entities/user.entity';
import { TJWTToken, TSignatureObject } from '@/utils/types';
import { EUserMessages } from '@/user/user.message';

import { checkIsEmail } from '@/utils/helpers';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(
    @Inject(EProviderTokens.PRISMA_CLIENT) private PrismaService: PrismaService,
  ) {}

  async findUsersForGlobalSearch(
    ids: number[],
    selfUserId: number,
    limit: number,
  ): Promise<TUserWithProfile[]> {
    return await this.PrismaService.user.findMany({
      where: { id: { in: ids, not: selfUserId } },
      include: {
        Profile: true,
      },
      take: limit,
    });
  }
}
