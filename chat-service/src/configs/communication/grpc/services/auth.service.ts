import type { ClientSocketAuthDTO } from '@/auth/auth.dto'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  AuthService as AuthServiceType,
  ValidateSocketAuthResponse,
} from 'protos/generated/auth'
import type { Socket } from 'socket.io'

export class AuthService {
  constructor(private instance: AuthServiceType) {}

  async validateSocketConnection(socket: Socket): Promise<void> {
    await this.instance.ValidateSocketConnection({ socket })
  }

  async validateSocketAuth(socket: Socket): Promise<ClientSocketAuthDTO> {
    return (
      (await this.instance.ValidateSocketAuth({
        clientSocket: socket,
      })) as TCastedFieldObject<ValidateSocketAuthResponse, 'clientSocketAuth', ClientSocketAuthDTO>
    ).clientSocketAuth
  }
}
