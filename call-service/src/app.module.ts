import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { RequestLoggerMiddleware } from './app.middleware'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './configs/db/prisma.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { VoiceCallGatewayModule } from './voice-call/voice-call.module'

const globalConfigModules = [
  ConfigModule.forRoot({
    envFilePath: ['.env.development', '.env'],
  }),
  PrismaModule,
  EventEmitterModule.forRoot({ verboseMemoryLeak: true, delimiter: ':' }),
]

@Module({
  imports: [...globalConfigModules, VoiceCallGatewayModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*')
  }
}
