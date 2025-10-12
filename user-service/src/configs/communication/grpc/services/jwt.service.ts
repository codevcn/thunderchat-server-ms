import type { JWTService as JWTServiceType } from 'protos/generated/auth'
import type { TJWTToken } from '@/utils/types'
import { firstValueFrom } from 'rxjs'

type TCreateJWTRes = {
  email: string
  user_id: number
}

type TGetJWTcookieOtpsRes = {
  [key: string]: string | number | boolean
}

export class JWTService {
  constructor(private instance: JWTServiceType) {}

  async createJWT({ email, user_id }: TCreateJWTRes): Promise<TJWTToken> {
    const res = await firstValueFrom(
      this.instance.CreateJWT({
        email,
        userId: user_id,
      })
    )

    return { jwt_token: res.jwtToken }
  }

  async getJWTcookieOtps(): Promise<TGetJWTcookieOtpsRes> {
    return JSON.parse(
      (await firstValueFrom(this.instance.GetJWTcookieOtps({}))).cookieOtpsJson
    ) as TGetJWTcookieOtpsRes
  }
}
