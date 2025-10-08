import { Module } from '@nestjs/common'
import { VoiceCallGateway } from './voice-call.gateway'
import { VoiceCallService } from './voice-call.service'
import { GrpcClientModule } from '@/configs/communication/grpc/grpc-client.module'
import { VoiceCallConnectionService } from '@/connection/voice-call-connection.service'

@Module({
  imports: [GrpcClientModule],
  providers: [VoiceCallGateway, VoiceCallService, VoiceCallConnectionService],
})
export class VoiceCallGatewayModule {}
