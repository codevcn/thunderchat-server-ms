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

export type TValidateVoiceCallSocketAuthPayload = ValidateVoiceCallSocketAuthRequest

export type TValidateVoiceCallSocketAuthRes = ValidateVoiceCallSocketAuthResponse

export type TValidateSocketConnectionPayload = ValidateSocketConnectionRequest

export type TValidateSocketAuthPayload = ValidateSocketAuthRequest

export type TValidateSocketAuthRes = ValidateSocketAuthResponse

export type TVerifyTokenRes = VerifyTokenResponse

export type TGetJWTcookieOtpsRes = GetJWTcookieOtpsResponse
