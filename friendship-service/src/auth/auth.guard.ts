import { Request } from 'express';
import { EClientCookieNames } from '@/utils/enums';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import type { TJWTPayload } from './auth.type';
import { EAuthMessages } from './auth.message';
import { TUserWithProfile } from '@/utils/entities/user.entity';
import { type ClientGrpc } from '@nestjs/microservices';
import type { AuthService, VerifyTokenResponse } from './auth';
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private AuthClient: ClientGrpc) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authenticateUser(context);
    return true;
  }

  private async authenticateUser(context: ExecutionContext): Promise<void> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException(EAuthMessages.TOKEN_NOT_FOUND);
    }

    const result = await this.authService.VerifyToken({ token });

    req['user'] = result.user;
  }

  private extractToken(req: Request): string | undefined {
    return req.cookies[EClientCookieNames.JWT_TOKEN_AUTH] || undefined;
  }
}
