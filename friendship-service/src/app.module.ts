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

import { FriendModule } from './friend/friend.module';
import { RequestLoggerMiddleware } from './app.middleware';
import { FriendRequestModule } from './friend-request/friend-request.module';

@Module({
  imports: [...globalConfigModules, FriendModule, FriendRequestModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
