import { EGrpcPackages } from '@/utils/enums';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export class GrpcClientConfig {
  static getUserConnectionClient(): ClientProviderOptions {
    return {
      name: 'USER_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(
          __dirname,
          '../../../../../protos/artifacts/user.proto',
        ),
        url: `0.0.0.0:${process.env.USER_SERVICE_PORT}`,
      },
    };
  }

  static getChatConnectionClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.CHAT_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.CHAT,
        protoPath: join(
          __dirname,
          '/../../../../protos/artifacts/',
          'chat.proto',
        ),
        url: `localhost:${process.env.CHAT_SERVICE_PORT}`,
      },
    };
  }
}
