import type {
  CreateNewMessageRequest,
  CreateNewMessageResponse,
  GetNewerDirectMessagesRequest,
  GetNewerDirectMessagesResponse,
  MessageService,
  UpdateLastSentMessageRequest,
} from 'protos/generated/conversation'
import { Empty } from 'protos/generated/google/protobuf/empty'

export interface IMessageService extends MessageService {
  GetNewerDirectMessages(
    request: GetNewerDirectMessagesRequest
  ): Promise<GetNewerDirectMessagesResponse>
  CreateNewMessage(request: CreateNewMessageRequest): Promise<CreateNewMessageResponse>
  UpdateLastSentMessage(request: UpdateLastSentMessageRequest): Promise<Empty>
}
