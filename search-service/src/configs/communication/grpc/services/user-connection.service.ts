import { TCastedFieldObject } from '@/utils/types';
import type {
  CheckUserIsOnlineResponse,
  UserConnectionService as UserConnectionServiceType,
} from '../../../../../protos/generated/chat';

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async checkUserIsOnline(userId: number): Promise<boolean> {
    return (
      (await this.instance.CheckUserIsOnline({ userId })) as TCastedFieldObject<
        CheckUserIsOnlineResponse,
        'isOnline',
        boolean
      >
    ).isOnline;
  }
}
