import { PrismaService } from '@/configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { Inject, Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class MessageMappingsService {
  private readonly KEY_LENGTH = 32 // 256 bits

  constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

  async findByUserId(userId: number) {
    return this.prismaService.messageMapping.findUnique({
      where: { userId },
    })
  }

  async createMessageMappings(userId: number): Promise<void> {
    const existing = await this.findByUserId(userId)
    if (!existing) {
      await this.prismaService.messageMapping.create({
        data: {
          userId,
          key: crypto.randomBytes(this.KEY_LENGTH).toString('hex'),
        },
      })
    }
  }
}
