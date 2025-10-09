import { EGrpcPackages } from '@/utils/enums';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export class GrpcClientConfig {
  static getAuthClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.AUTH_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.AUTH,
        protoPath: join(
          __dirname,
          '../../../../protos/artifacts/',
          'auth.proto',
        ),
        url: `localhost:${process.env.USER_SERVICE_PORT}`,
      },
    };
  }
  static getSearchClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.SEARCH_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.SEARCH,
        protoPath: join(
          __dirname,
          '../../../../protos/artifacts/',
          'search.proto',
        ),
        url: `localhost:${process.env.USER_SERVICE_PORT}`,
      },
    };
  }
}
