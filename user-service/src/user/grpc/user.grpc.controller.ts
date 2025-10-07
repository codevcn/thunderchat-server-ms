import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../user.service';
import { Controller } from '@nestjs/common';
@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'getUserByEmail')
  async getUserByEmail(data: { email: string }) {
    const user = await this.userService.getUserByEmail(data.email);
    return { user };
  }
}
