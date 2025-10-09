import type { TUser, TUserWithProfile } from '@/utils/entities/user.entity';

import type {
  FindByIdResponse,
  GetUserByEmailResponse,
  UserService as UserServiceType,
} from '../../../../../protos/generated/user';
import { TGetFriendRequestsData } from '@/friend-request/friend-request.type';
import { TUserId } from '@/user/user.type';
import { TSocketId } from '@/connection/user-connection.type';
import { TCastedFieldObject } from '@/utils/types';

export class UserService {
  constructor(private instance: UserServiceType) {}

  async GetUserByEmail(email: string): Promise<TUserWithProfile> {
    return (
      (await this.instance.GetUserByEmail({
        email,
      })) as TCastedFieldObject<
        GetUserByEmailResponse,
        'user',
        TUserWithProfile
      >
    ).user;
  }

  async FindById(id: number): Promise<TUser | null> {
    return (
      (await this.instance.FindById({
        id,
      })) as TCastedFieldObject<FindByIdResponse, 'user', TUser>
    ).user;
  }
}
