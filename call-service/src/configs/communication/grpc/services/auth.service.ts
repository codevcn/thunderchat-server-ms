import type { VoiceCallSocketAuthDTO } from '@/auth/auth.dto'
import { TVoiceCallClientSocket } from '@/utils/events/event.type'
import type { AuthService as AuthServiceType } from 'protos/generated/auth'
import { firstValueFrom } from 'rxjs'
import type { Socket } from 'socket.io'

export class AuthService {
  constructor(private instance: AuthServiceType) {}

  async validateSocketConnection(socket: Socket): Promise<void> {
    await firstValueFrom(
      this.instance.ValidateSocketConnection({ socketJson: JSON.stringify(socket) })
    )
  }

  async validateVoiceCallSocketAuth(
    clientSocket: TVoiceCallClientSocket
  ): Promise<VoiceCallSocketAuthDTO> {
    return JSON.parse(
      (
        await firstValueFrom(
          this.instance.ValidateVoiceCallSocketAuth({
            clientSocketJson: JSON.stringify(clientSocket),
          })
        )
      ).voiceCallSocketAuthJson
    ) as VoiceCallSocketAuthDTO
  }
}
