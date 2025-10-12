import type { TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import type { UserService as UserServiceType } from 'protos/generated/user'
import { firstValueFrom } from 'rxjs'

export class UserService {
  constructor(private instance: UserServiceType) {}

  async GetUserByEmail(email: string): Promise<TUserWithProfile> {
    const res = await firstValueFrom(this.instance.GetUserByEmail({ email }))
    return JSON.parse(res.userJson) as TUserWithProfile
  }

  async FindById(id: number): Promise<TUser | null> {
    return JSON.parse(
      (
        await firstValueFrom(
          this.instance.FindById({
            id,
          })
        )
      ).userJson
    ) as TUser | null
  }

  async findUserWithProfileById(userId: number): Promise<TUserWithProfile | null> {
    return JSON.parse(
      (
        await firstValueFrom(
          this.instance.FindUserWithProfileById({
            userId,
          })
        )
      ).userJson
    ) as TUserWithProfile | null
  }
}
