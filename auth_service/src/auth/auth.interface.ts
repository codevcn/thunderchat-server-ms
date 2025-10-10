import type { Response } from 'express'
import type {
  LoginUserDTO,
  AdminLoginDTO,
  CheckAuthDataDTO,
  CheckAdminEmailDTO,
  LogoutPayloadDTO,
} from './auth.dto'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { TSuccess } from '@/utils/types'
import {
  CompareHashedPasswordRequest,
  CompareHashedPasswordResponse,
  CreateJWTRequest,
  CreateJWTResponse,
  GetHashedPasswordRequest,
  GetHashedPasswordResponse,
} from 'protos/generated/auth'
import type {
  TValidateVoiceCallSocketAuthRes,
  TValidateVoiceCallSocketAuthPayload,
  TValidateSocketConnectionPayload,
  TValidateSocketAuthPayload,
  TValidateSocketAuthRes,
  TVerifyTokenRes,
  TGetJWTcookieOtpsRes,
} from './auth.type'
import type { VerifyTokenRequest } from './auth'

export interface IAuthController {
  login: (loginUserPayload: LoginUserDTO, res: Response) => Promise<TSuccess>
  adminLogin: (adminLoginPayload: AdminLoginDTO, res: Response) => Promise<TSuccess>
  checkAdminEmail: (
    checkAdminEmailPayload: CheckAdminEmailDTO
  ) => Promise<{ isAdmin: boolean; message?: string }>
  logout: (res: Response, user: TUserWithProfile, reqBody: LogoutPayloadDTO) => Promise<TSuccess>
  checkAuth: (user: TUserWithProfile) => Promise<CheckAuthDataDTO>
  checkAdminAuth: (user: TUserWithProfile) => Promise<CheckAuthDataDTO>
}

export interface IAuthGrpcController {
  ValidateSocketAuth: (data: TValidateSocketAuthPayload) => Promise<TValidateSocketAuthRes>
  ValidateSocketConnection: (data: TValidateSocketConnectionPayload) => Promise<void>
  ValidateVoiceCallSocketAuth: (
    data: TValidateVoiceCallSocketAuthPayload
  ) => Promise<TValidateVoiceCallSocketAuthRes>
  VerifyToken: (data: VerifyTokenRequest) => Promise<TVerifyTokenRes>
  CreateJWT: (data: CreateJWTRequest) => Promise<CreateJWTResponse>
  GetJWTcookieOtps: () => Promise<TGetJWTcookieOtpsRes>
  CompareHashedPassword: (
    data: CompareHashedPasswordRequest
  ) => Promise<CompareHashedPasswordResponse>
  GetHashedPassword: (data: GetHashedPasswordRequest) => Promise<GetHashedPasswordResponse>
}
