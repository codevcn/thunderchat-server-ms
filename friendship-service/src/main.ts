import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { clearLogFiles } from './dev/helpers'
import { ValidationPipe } from '@nestjs/common'
import { BaseHttpExceptionFilter } from './utils/exception-filters/base-http-exception.filter'
import cookieParser from 'cookie-parser'
import { copyProtos } from '@/bootstrap/copy-protos-folder'

const apiPrefix: string = 'api'
const beforeLaunch = async () => {
  await clearLogFiles()
  await copyProtos(
    join(__dirname, '/../../protos/artifacts/'),
    join(__dirname, '/../protos/artifacts/')
  )
}

const getAppModule = async () => {
  const { AppModule } = await import('./app.module')
  return AppModule
}
async function bootstrap() {
  await beforeLaunch()
  console.log('>>> Microservice [Chat-Service] is launching...')

  const AppModule = await getAppModule()
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const { PORT, NODE_ENV, HOST_ADDRESS, GRPC_PORT } = process.env
  const CLIENT_HOST =
    NODE_ENV === 'production' ? process.env.CLIENT_HOST : process.env.CLIENT_HOST_DEV

  // set api prefix
  app.setGlobalPrefix(apiPrefix)

  // for getting cookie in request
  app.use(cookieParser())

  // cors
  app.enableCors({
    origin: '*',
    credentials: true,
  })

  // global exception filter
  app.useGlobalFilters(new BaseHttpExceptionFilter())

  // to be able to use dtos in controllers
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  // gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'friend',
      protoPath: join(__dirname, '../protos/artifacts/friend.proto'),
      url: `${HOST_ADDRESS}:${GRPC_PORT}`,
    },
  })

  await clearLogFiles()

  await app.startAllMicroservices()
  await app.listen(PORT, '0.0.0.0')
  console.log('>>> Microservice [friend-Service] is listening on port:', PORT)
}
bootstrap()
