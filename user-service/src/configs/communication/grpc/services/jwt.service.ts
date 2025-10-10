import type { GetJWTcookieOtpsResponse, JWTService as JWTServiceType } from 'protos/generated/auth'
import type { TCastedFields, TJWTToken } from '@/utils/types'

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
    const res = await this.instance.CreateJWT({
      email,
      userId: user_id,
    })

    return { jwt_token: res.jwtToken }
  }

  async getJWTcookieOtps(): Promise<TGetJWTcookieOtpsRes> {
    return (
      (await this.instance.GetJWTcookieOtps({})) as TCastedFields<
        GetJWTcookieOtpsResponse,
        { cookieOtps: TGetJWTcookieOtpsRes }
      >
    ).cookieOtps
  }
}
