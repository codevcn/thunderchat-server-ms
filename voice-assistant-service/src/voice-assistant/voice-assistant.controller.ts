import { Controller, Post, Body } from '@nestjs/common';
import { VoiceAssistantService } from './voice-assistant.service';
import { VoiceCommandDto } from './voice-assistant.dto';
import { TUser } from '@/utils/entities/user.entity';
import { User } from '@/user/user.decorator';
import { ERoutes } from '@/utils/enums';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Controller(ERoutes.VOICE_ASSISTANT)
export class VoiceAssistantController {
  constructor(
    private readonly voiceService: VoiceAssistantService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Post('command')
  async handleCommand(@User() user: TUser, @Body() dto: VoiceCommandDto) {
    return this.voiceService.processCommand(user.id, dto.audioBase64);
  }

  @Post('reset-pending')
  async resetPending(@User() user: TUser) {
    const pendingKey = `voice:pending:${user.id}`;
    await this.redis.del(pendingKey);
    return { success: true };
  }
}
