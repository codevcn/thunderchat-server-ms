import { EGrpcPackages } from '@/utils/enums';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export class GrpcClientConfig {
  static getUserConnectionClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.CHAT_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.CHAT,
        protoPath: join(
          __dirname,
          '../../../../../protos/artifacts/chat.proto',
        ),
        url: `0.0.0.0:${process.env.USER_SERVICE_PORT}`,
      },
    };
  }
}
