import type { VoiceCallSocketAuthDTO } from '@/auth/auth.dto'
import { TVoiceCallClientSocket } from '@/utils/events/event.type'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  AuthService as AuthServiceType,
  ValidateVoiceCallSocketAuthResponse,
} from 'protos/generated/auth'
import type { Socket } from 'socket.io'

export class AuthService {
  constructor(private instance: AuthServiceType) {}

  async validateSocketConnection(socket: Socket): Promise<void> {
    await this.instance.ValidateSocketConnection({ socket })
  }

  async validateVoiceCallSocketAuth(
    clientSocket: TVoiceCallClientSocket
  ): Promise<VoiceCallSocketAuthDTO> {
    return (
      (await this.instance.ValidateVoiceCallSocketAuth({
        clientSocket,
      })) as TCastedFieldObject<
        ValidateVoiceCallSocketAuthResponse,
        'voiceCallSocketAuth',
        VoiceCallSocketAuthDTO
      >
    ).voiceCallSocketAuth as VoiceCallSocketAuthDTO
  }
}
