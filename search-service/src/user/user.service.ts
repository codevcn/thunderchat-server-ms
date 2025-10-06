import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import type {
  TCreateUserParams,
  TSearchUsersData,
  TSearchProfilesData,
} from './user.type';
import { PrismaService } from '../configs/db/prisma.service';
import { EProviderTokens, ESyncDataToESWorkerType } from '@/utils/enums';

import { EAuthMessages } from '@/auth/auth.message';
import { TUser, TUserWithProfile } from '@/utils/entities/user.entity';
import { TJWTToken, TSignatureObject } from '@/utils/types';
import { SearchUsersDTO } from './user.dto';
import { EUserMessages } from '@/user/user.message';
import { SyncDataToESService } from '@/configs/elasticsearch/sync-data-to-ES/sync-data-to-ES.service';
import { ClientGrpc, GrpcMethod } from '@nestjs/microservices';
import {
  FindUsersForGlobalSearchRequest,
  FindUsersForGlobalSearchResponse,
} from './user.proto';
import type { UserService as userProto } from '../user/user.proto';

@Injectable()
export class UserService {
  private userService: userProto;

  @GrpcMethod('UserService', 'FindUsersForGlobalSearch')
  async findUsersForGlobalSearch(
    data: FindUsersForGlobalSearchRequest,
  ): Promise<FindUsersForGlobalSearchResponse> {
    const response = await this.userService.FindUsersForGlobalSearch(data);
    return response;
  }
}
