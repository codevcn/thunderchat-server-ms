import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './configs/db/prisma.module'
import { EventEmitterModule } from '@nestjs/event-emitter'

const globalConfigModules = [
  ConfigModule.forRoot({
    envFilePath: ['.env.development', '.env'],
  }),
  PrismaModule,
  EventEmitterModule.forRoot({ verboseMemoryLeak: true, delimiter: ':' }),
]

import { UserModule } from './user/user.module'
import { RequestLoggerMiddleware } from './app.middleware'
import { UserReportModule } from './user/user-report/user-report.module'
import { UserSettingsModule } from './user/user-settings/user-settings.module'
import { ProfileModule } from './profile/profile.module'

@Module({
  imports: [
    ...globalConfigModules,
    UserModule,
    UserSettingsModule,
    UserReportModule,
    ProfileModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*path')
  }
}
