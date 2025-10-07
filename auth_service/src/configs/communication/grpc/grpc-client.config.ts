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
}
