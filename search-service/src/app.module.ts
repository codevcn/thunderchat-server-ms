import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidation } from './utils/validation/env.validation';
import { PrismaModule } from './configs/db/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

const globalConfigModules = [
  ConfigModule.forRoot({
    envFilePath: ['.env.development', '.env'],
    validate: envValidation,
  }),
  PrismaModule,
  EventEmitterModule.forRoot({ verboseMemoryLeak: true, delimiter: ':' }),
];

import { SearchModule } from './search/search.module';
import { RequestLoggerMiddleware } from './app.middleware';

@Module({
  imports: [...globalConfigModules, SearchModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
