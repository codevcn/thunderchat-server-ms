import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { UserService as UserServiceType } from 'protos/generated/user'
import { firstValueFrom } from 'rxjs'

export class UserService {
  constructor(private instance: UserServiceType) {}

  async findUserWithProfileById(userId: number): Promise<TUserWithProfile | null> {
    const user = (
      await firstValueFrom(
        this.instance.FindUserWithProfileById({
          userId,
        })
      )
    ).userJson
    return user ? (JSON.parse(user) as TUserWithProfile) : null
  }
}
