import { ClientSocketAuthDTO } from '@/auth/auth.dto'
import { TCastedFieldObject } from '@/utils/types'
import type {
  AuthService,
  ValidateSocketAuthResponse,
  ValidateSocketAuthRequest,
  ValidateSocketConnectionRequest,
} from 'protos/generated/auth'
import type { Empty } from 'protos/generated/google/protobuf/empty'

export interface IAuthService extends AuthService {
  ValidateSocketConnection(request: ValidateSocketConnectionRequest): Promise<Empty>
  ValidateSocketAuth(
    request: ValidateSocketAuthRequest
  ): Promise<
    TCastedFieldObject<ValidateSocketAuthResponse, 'clientSocketAuth', ClientSocketAuthDTO>
  >
}
