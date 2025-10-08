import { FindMessagesForGlobalSearchResponse } from 'protos/generated/conversation'
import type { FetchMsgsParamsDTO } from './message.dto'
import type { TFindMessagesForGlobalSearchPayload, TGetDirectMessagesData } from './message.type'

export interface IMessageController {
  fetchMessages: (directChatId: FetchMsgsParamsDTO) => Promise<TGetDirectMessagesData>
}

export interface IMessageGrpcController {
  findMessagesForGlobalSearch(
    data: TFindMessagesForGlobalSearchPayload
  ): Promise<FindMessagesForGlobalSearchResponse>
}
