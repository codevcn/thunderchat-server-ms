import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { clearLogFiles } from './dev/helpers';
import { ValidationPipe } from '@nestjs/common';
import { BaseHttpExceptionFilter } from './utils/exception-filters/base-http-exception.filter';
import cookieParser from 'cookie-parser';

const apiPrefix: string = 'api';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { PORT, NODE_ENV } = process.env;
  const CLIENT_HOST =
    NODE_ENV === 'production'
      ? process.env.CLIENT_HOST
      : process.env.CLIENT_HOST_DEV;

  // set api prefix
  app.setGlobalPrefix(apiPrefix);

  // for getting cookie in request
  app.use(cookieParser());

  // cors
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // global exception filter
  app.useGlobalFilters(new BaseHttpExceptionFilter());

  // to be able to use dtos in controllers
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../protos/artifacts/user.proto'),
      url: '0.0.0.0:50054',
    },
  });

  await clearLogFiles();

  await app.startAllMicroservices();
  await app.listen(PORT, '0.0.0.0');
  console.log('>>> Microservice [Notification-Service] is listening on port:', PORT);
}
bootstrap();
