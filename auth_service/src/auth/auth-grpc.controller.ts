import { Controller, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { GrpcMethod } from '@nestjs/microservices'
import type { IAuthGrpcController } from './auth.interface'
import { EGrpcServices } from '@/utils/enums'
import { JWTService } from './jwt/jwt.service'
import {
  CompareHashedPasswordRequest,
  CreateJWTRequest,
  GetHashedPasswordRequest,
  VerifyTokenRequest,
} from 'protos/generated/auth'
import { CredentialService } from './credentials/credentials.service'
import type {
  TJWTPayload,
  TValidateSocketAuthPayload,
  TValidateSocketConnectionPayload,
  TValidateVoiceCallSocketAuthPayload,
  TVerifyTokenRes,
} from './auth.type'
import { TUserWithProfile } from '@/utils/entities/user.entity'
import { EAuthMessages } from './auth.message'
import { UserService } from '@/configs/communication/grpc/services/user.service'

@Controller()
export class AuthGrpcController implements IAuthGrpcController {
  private userService: UserService

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JWTService,
    private readonly credentialsService: CredentialService
  ) {}

  @GrpcMethod(EGrpcServices.AUTH_SERVICE, 'ValidateSocketConnection')
  async ValidateSocketConnection(data: TValidateSocketConnectionPayload) {
    await this.authService.validateSocketConnection(data.socket)
  }

  @GrpcMethod(EGrpcServices.AUTH_SERVICE, 'ValidateSocketAuth')
  async ValidateSocketAuth(data: TValidateSocketAuthPayload) {
    return {
      clientSocketAuth: await this.authService.validateSocketAuth(data.clientSocket),
    }
  }

  @GrpcMethod(EGrpcServices.AUTH_SERVICE, 'ValidateVoiceCallSocketAuth')
  async ValidateVoiceCallSocketAuth(data: TValidateVoiceCallSocketAuthPayload) {
    return {
      voiceCallSocketAuth: await this.authService.validateVoiceCallSocketAuth(data.clientSocket),
    }
  }

  @GrpcMethod(EGrpcServices.AUTH_SERVICE, 'VerifyToken')
  async VerifyToken(data: VerifyTokenRequest): Promise<TVerifyTokenRes> {
    let payload: TJWTPayload
    let user: TUserWithProfile | null | undefined
    try {
      payload = await this.jwtService.verifyToken(data.token)
    } catch (error) {
      throw new UnauthorizedException(EAuthMessages.AUTHENTICATION_FAILED)
    }
    try {
      user = await this.userService.findUserWithProfileById(payload.user_id)
    } catch (error) {
      throw new UnauthorizedException(EAuthMessages.AUTHENTICATION_FAILED)
    }
    if (!user) {
      throw new UnauthorizedException(EAuthMessages.USER_NOT_FOUND)
    }
    if (!user.Profile) {
      throw new InternalServerErrorException(EAuthMessages.USER_HAS_NO_PROFILE)
    }
    const banResult = await this.authService.checkUserBanStatus(user.id)
    if (banResult.isBanned) {
      throw new UnauthorizedException(banResult.message || EAuthMessages.USER_BANNED)
    }
    return {
      user,
    }
  }

  @GrpcMethod(EGrpcServices.JWT_SERVICE, 'CreateJWT')
  async CreateJWT(data: CreateJWTRequest) {
    const { jwt_token } = await this.jwtService.createJWT({
      email: data.email,
      user_id: data.userId,
    })
    return {
      jwtToken: jwt_token,
    }
  }

  @GrpcMethod(EGrpcServices.CREDENTIALS_SERVICE, 'GetJWTcookieOtps')
  async GetJWTcookieOtps() {
    return {
      cookieOtps: this.jwtService.getJWTcookieOtps(),
    }
  }

  @GrpcMethod(EGrpcServices.JWT_SERVICE, 'CompareHashedPassword')
  async CompareHashedPassword(data: CompareHashedPasswordRequest) {
    const isValid = await this.credentialsService.compareHashedPassword(
      data.password,
      data.encrypted
    )
    return {
      isValid,
    }
  }

  @GrpcMethod(EGrpcServices.CREDENTIALS_SERVICE, 'GetHashedPassword')
  async GetHashedPassword(data: GetHashedPasswordRequest) {
    const hashedPassword = await this.credentialsService.getHashedPassword(data.plainPassword)
    return {
      hashedPassword,
    }
  }
}
