import type {
  ConnectedClientsCountResponse,
  EmitToDirectChatRequest,
  UserConnectionService,
} from 'protos/generated/chat'
import type { Empty } from 'protos/generated/google/protobuf/empty'

export interface IUserConnectionService extends UserConnectionService {
  GetConnectedClientsCountForAdmin(request: Empty): Promise<ConnectedClientsCountResponse>
  EmitToDirectChat(request: EmitToDirectChatRequest): Promise<Empty>
}
