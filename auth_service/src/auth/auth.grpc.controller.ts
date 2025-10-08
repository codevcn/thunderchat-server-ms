import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import { EGrpcServices } from '@/utils/enums';
import { ValidateSocketAuthRequest } from 'protos/generated/auth';
import { TClientSocket } from '@/utils/events/event.type';
import { IAuthGrpcController } from './auth.interface';
import { Socket } from 'socket.io';

@Controller()
export class AuthGrpcController implements IAuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', ' ValidateSocketConnection')
  async ValidateSocketConnection(data: Socket) {
    await this.authService.validateSocketConnection(data);
  }

  @GrpcMethod('AuthService', ' ValidateSocketAuth')
  async ValidateSocketAuth(data: TClientSocket) {
    const clientSocket = await this.authService.validateSocketAuth(data);
    return clientSocket;
  }
}
