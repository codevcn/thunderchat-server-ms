import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './configs/db/prisma.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { JwtModule } from '@nestjs/jwt'
import ms from 'ms'

const globalConfigModules = [
  ConfigModule.forRoot({
    envFilePath: ['.env.development', '.env'],
  }),
  PrismaModule,
  JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: ms(process.env.JWT_TOKEN_MAX_AGE_IN_HOUR),
    },
  }),
  EventEmitterModule.forRoot({ verboseMemoryLeak: true, delimiter: ':' }),
]

import { AuthModule } from './auth/auth.module'
import { RequestLoggerMiddleware } from './app.middleware'

@Module({
  imports: [...globalConfigModules, AuthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*path')
  }
}
