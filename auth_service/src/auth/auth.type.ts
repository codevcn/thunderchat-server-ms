import type { TCastedFields } from '@/utils/types'
import type { CookieOptions, Response } from 'express'
import type {
  GetJWTcookieOtpsResponse,
  ValidateSocketAuthRequest,
  ValidateSocketAuthResponse,
  ValidateSocketConnectionRequest,
  ValidateVoiceCallSocketAuthRequest,
  ValidateVoiceCallSocketAuthResponse,
  VerifyTokenResponse,
} from 'protos/generated/auth'
import type { Socket } from 'socket.io'
import { ClientSocketAuthDTO, VoiceCallSocketAuthDTO } from './auth.dto'
import { TUserWithProfile } from '@/utils/entities/user.entity'

export type TLoginUserParams = {
  email: string
  password: string
}

export type TJWTPayload = {
  user_id: number
  email: string
}

export type TSendJWTParams = {
  response: Response
  token: string
  cookie_otps?: CookieOptions
}

export type TRemoveJWTParams = {
  response: Response
  cookie_otps?: CookieOptions
}

export type TValidateVoiceCallSocketAuthPayload = TCastedFields<
  ValidateVoiceCallSocketAuthRequest,
  { clientSocket: Socket }
>

export type TValidateVoiceCallSocketAuthRes = TCastedFields<
  ValidateVoiceCallSocketAuthResponse,
  { voiceCallSocketAuth: VoiceCallSocketAuthDTO }
>

export type TValidateSocketConnectionPayload = TCastedFields<
  ValidateSocketConnectionRequest,
  { socket: Socket }
>

export type TValidateSocketAuthPayload = TCastedFields<
  ValidateSocketAuthRequest,
  { clientSocket: Socket }
>

export type TValidateSocketAuthRes = TCastedFields<
  ValidateSocketAuthResponse,
  { clientSocketAuth: ClientSocketAuthDTO }
>

export type TVerifyTokenRes = TCastedFields<VerifyTokenResponse, { user: TUserWithProfile }>

export type TGetJWTcookieOtpsRes = TCastedFields<
  GetJWTcookieOtpsResponse,
  { cookieOtps: CookieOptions }
>
