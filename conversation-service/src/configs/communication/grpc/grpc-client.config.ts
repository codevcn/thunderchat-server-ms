import { EGrpcPackages } from '@/utils/enums'
import { ClientProviderOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'

export class GrpcClientConfig {
  static getSearchClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.SEARCH_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.SEARCH,
        protoPath: join(__dirname, '/../../../../protos/artifacts/', 'search.proto'),
        url: `localhost:${process.env.SEARCH_SERVICE_PORT}`,
      },
    }
  }

  static getMediaClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.MEDIA_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.MEDIA,
        protoPath: join(__dirname, '/../../../../protos/artifacts/', 'media.proto'),
        url: `localhost:${process.env.MEDIA_SERVICE_PORT}`,
      },
    }
  }

  static getUserConnectionClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.CHAT_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.CHAT,
        protoPath: join(__dirname, '/../../../../protos/artifacts/', 'chat.proto'),
        url: `localhost:${process.env.CHAT_SERVICE_PORT}`,
      },
    }
  }
}
