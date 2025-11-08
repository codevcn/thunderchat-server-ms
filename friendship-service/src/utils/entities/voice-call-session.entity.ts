import type { VoiceCallSession } from '@prisma/client'
import type { TUserWithProfile } from './user.entity'

export type TCallSession = VoiceCallSession

export type TCallSessionWithUsers = VoiceCallSession & {
  caller: TUserWithProfile
  callee: TUserWithProfile
}

export type TCallSessionId = TCallSession['id']
