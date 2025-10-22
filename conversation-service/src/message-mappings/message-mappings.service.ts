import { PrismaService } from '@/configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { SystemException } from '@/utils/exceptions/system.exception'
import { Inject, Injectable } from '@nestjs/common'
import { EMessageMappingsMessages } from './message-mappings.message'
import { TMessageMappings } from '@/utils/entities/message-mappings.entity'

@Injectable()
export class MessageMappingsService {
  constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

  async getMessageMappings(): Promise<TMessageMappings | null> {
    return this.prismaService.messageMapping.findUnique({
      where: { versionCode: process.env.MESSAGE_MAPPINGS_VERSION_CODE },
    })
  }

  async createMessageMappings(mappings: string, encryptionKey: string): Promise<TMessageMappings> {
    const existing = await this.getMessageMappings()
    if (existing) {
      return existing
    }
    return await this.prismaService.messageMapping.create({
      data: {
        mappings,
        key: encryptionKey,
        versionCode: process.env.MESSAGE_MAPPINGS_VERSION_CODE,
      },
    })
  }

  async updateMessageMappings(
    mappings: string,
    encryptionKeyIfCreate?: string
  ): Promise<TMessageMappings> {
    const existing = await this.getMessageMappings()
    if (existing) {
      await this.prismaService.messageMapping.update({
        where: { id: existing.id },
        data: { mappings },
      })
      return existing
    } else if (encryptionKeyIfCreate) {
      return await this.createMessageMappings(mappings, encryptionKeyIfCreate)
    }
    throw new SystemException(EMessageMappingsMessages.NO_EXISTING_MESSAGE_MAPPINGS)
  }
}
