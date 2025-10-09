import type { TUserWithProfile } from '@/utils/entities/user.entity';
import type { TCastedFieldObject } from '@/utils/types';
import type {
  FindUserWithProfileByIdResponse,
  UserService as UserServiceType,
} from 'protos/generated/user';

export class UserService {
  constructor(private instance: UserServiceType) {}

  async findUserWithProfileById(
    userId: number,
  ): Promise<TUserWithProfile | null> {
    return (
      (
        (await this.instance.FindUserWithProfileById({
          userId,
        })) as TCastedFieldObject<
          FindUserWithProfileByIdResponse,
          'user',
          TUserWithProfile | undefined
        >
      ).user || null
    );
  }
}
