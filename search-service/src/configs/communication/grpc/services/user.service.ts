import { TUserWithProfile } from '@/utils/entities/user.entity';
import type {
  findUsersForGlobalSearchRp,
  UserService as userServiceType,
} from '../../../../../protos/generated/user';
import { TCastedFieldObject } from '@/utils/types';

export class UserService {
  constructor(private instance: userServiceType) {}

  async findUsersForGlobalSearch(
    ids: number[],
    selfUserId: number,
    limit: number,
  ): Promise<TUserWithProfile[]> {
    return (
      (await this.instance.findUsersForGlobalSearch({
        ids,
        selfUserId,
        limit,
      })) as TCastedFieldObject<
        findUsersForGlobalSearchRp,
        'users',
        TUserWithProfile[]
      >
    ).users;
  }
}
