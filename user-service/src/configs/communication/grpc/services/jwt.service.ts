import type {
  CreateJWTResponse,
  JWTService as JWTServiceType,
} from '../../../../../protos/generated/auth';
import { TCastedFieldObject, TJWTToken } from '@/utils/types';

export class JWTService {
  constructor(private instance: JWTServiceType) {}

  async createJWT({
    email,
    user_id,
  }: {
    email: string;
    user_id: number;
  }): Promise<TJWTToken> {
    const res = await this.instance.CreateJWT({
      email,
      userId: user_id,
    });

    return { jwt_token: res.jwtToken };
  }
}
