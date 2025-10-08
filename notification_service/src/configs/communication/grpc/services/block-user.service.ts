import type { TBlockedUserFullInfo } from '@/utils/entities/user.entity';
import { TCastedFieldObject } from '@/utils/types';
import type {
  BlockUserService as BlockUserServiceType,
  CheckBlockedUserResponse,
} from '../../../../../../protos/generated/user';

export class BlockUserService {
  constructor(private instance: BlockUserServiceType) {}

  async checkBlockedUser(
    blockerId: number,
    blockedId: number,
  ): Promise<TBlockedUserFullInfo | null> {
    return (
      (
        (await this.instance.CheckBlockedUser({
          blockerId,
          blockedId,
        })) as TCastedFieldObject<
          CheckBlockedUserResponse,
          'blockedUser',
          TBlockedUserFullInfo | undefined
        >
      ).blockedUser || null
    );
  }
}
