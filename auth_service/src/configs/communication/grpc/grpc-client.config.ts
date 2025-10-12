import { EGrpcPackages } from '@/utils/enums'
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'

export class GrpcClientConfig {
  static getUserConnectionClient(): ClientsProviderAsyncOptions {
    return {
      name: EGrpcPackages.CHAT_PACKAGE,
      useFactory: () => ({
        transport: Transport.GRPC,
        options: {
          package: EGrpcPackages.CHAT,
          protoPath: join(__dirname, '/../../../../protos/artifacts/', 'chat.proto'),
          url: `0.0.0.0:${process.env.CHAT_SERVICE_PORT}`,
        },
      }),
    }
  }

  static getUserClient(): ClientsProviderAsyncOptions {
    return {
      name: EGrpcPackages.USER_PACKAGE,
      useFactory: () => ({
        transport: Transport.GRPC,
        options: {
          package: EGrpcPackages.USER,
          protoPath: join(__dirname, '/../../../../protos/artifacts/', 'user.proto'),
          url: `0.0.0.0:${process.env.USER_SERVICE_PORT}`,
        },
      }),
    }
  }
}
