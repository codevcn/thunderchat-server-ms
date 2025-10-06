import { EGrpcPackages } from '@/utils/enums'
import { ClientProviderOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'

export class GrpcClientConfig {
  static getUserConnectionClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.USER_CONNECTION_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.USER_CONNECTION,
        protoPath: join(__dirname, '/../../../../protos/artifacts/', 'user-connection.proto'),
        url: `localhost:${process.env.USER_CONNECTION_REMOTE_PORT}`,
      },
    }
  }

  static getUploadClient(): ClientProviderOptions {
    return {
      name: EGrpcPackages.UPLOAD_PACKAGE,
      transport: Transport.GRPC,
      options: {
        package: EGrpcPackages.UPLOAD,
        protoPath: join(__dirname, '/../../../../protos/artifacts/', 'upload.proto'),
        url: `localhost:${process.env.UPLOAD_REMOTE_PORT}`,
      },
    }
  }
}
