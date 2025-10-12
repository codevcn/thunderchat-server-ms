import type { ClientSocketAuthDTO } from '@/auth/auth.dto'
import type { AuthService as AuthServiceType } from 'protos/generated/auth'
import { firstValueFrom } from 'rxjs'
import type { Socket } from 'socket.io'

export class AuthService {
  constructor(private instance: AuthServiceType) {}

  async validateSocketConnection(socket: Socket): Promise<void> {
    await firstValueFrom(
      this.instance.ValidateSocketConnection({
        handshakeHeadersJson: JSON.stringify(socket.handshake.headers),
      })
    )
  }

  async validateSocketAuth(socket: Socket): Promise<ClientSocketAuthDTO> {
    return JSON.parse(
      (
        await firstValueFrom(
          this.instance.ValidateSocketAuth({
            handshakeAuthJson: JSON.stringify(socket.handshake.auth),
          })
        )
      ).clientSocketAuthJson
    ) as ClientSocketAuthDTO
  }
}
