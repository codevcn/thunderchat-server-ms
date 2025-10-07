import { Injectable, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  getUserByEmailRequest,
  getUserByEmailResponse,
  UserService as UserServiceGrpc, // đây là interface sinh từ proto
} from '../../protos/generated/user';

@Injectable()
export class UserService {
  private userServiceClient: UserServiceGrpc;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {
    this.userServiceClient =
      this.client.getService<UserServiceGrpc>('UserService');
  }

  async findUserByEmail(
    data: getUserByEmailRequest,
  ): Promise<getUserByEmailResponse> {
    const response = await this.userServiceClient.getUserByEmail(data);
    return response;
  }
}
