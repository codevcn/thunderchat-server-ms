import type { JWTService as JWTServiceType } from 'protos/generated/auth'
import type { TJWTToken } from '@/utils/types'
import { firstValueFrom } from 'rxjs'

type TCreateJWTPayload = {
  email: string
  user_id: number
}

export class JWTService {
  constructor(private instance: JWTServiceType) {}

  async createJWT({ email, user_id }: TCreateJWTPayload): Promise<TJWTToken> {
    const res = await firstValueFrom(
      this.instance.CreateJWT({
        email,
        userId: user_id,
      })
    )

    return { jwt_token: res.jwtToken }
  }
}
