import { TMessageForGlobalSearch } from '@/utils/entities/message.entity';
import type {
  FindMessagesForGlobalSearchResponse,
  MessageService as MessageServiceType,
} from '../../../../../protos/generated/conversation';
import { TCastedFieldObject } from '@/utils/types';

export class MessageService {
  constructor(private instance: MessageServiceType) {}

  async findMessagesForGlobalSearch(
    ids: number[],
    limit: number,
  ): Promise<TMessageForGlobalSearch[]> {
    return (
      (await this.instance.FindMessagesForGlobalSearch({
        ids,
        limit,
      })) as TCastedFieldObject<
        FindMessagesForGlobalSearchResponse,
        'messages',
        TMessageForGlobalSearch[]
      >
    ).messages;
  }
}
