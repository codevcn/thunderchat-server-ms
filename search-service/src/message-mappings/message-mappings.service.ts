import { PrismaService } from '@/configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { SystemException } from '@/utils/exceptions/system.exception'
import { Inject, Injectable } from '@nestjs/common'
import { EMessageMappingsMessages } from './message-mappings.message'
import { TMessageMappings } from '@/utils/entities/message-mappings.entity'
import { SymmetricEncryptor } from '@/utils/crypto/symmetric-encryption.crypto'

@Injectable()
export class MessageMappingsService {
  private symmetricEncryptor: SymmetricEncryptor = new SymmetricEncryptor()

  constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

  async getMessageMappings(): Promise<TMessageMappings | null> {
    return this.prismaService.messageMapping.findUnique({
      where: { versionCode: process.env.MESSAGE_MAPPINGS_VERSION_CODE },
    })
  }

  async createMessageMappings(
    mappings: string,
    mappingsKey: string,
    dek: string
  ): Promise<TMessageMappings> {
    const existing = await this.getMessageMappings()
    if (existing) {
      return existing
    }
    return await this.prismaService.messageMapping.create({
      data: {
        mappings,
        key: mappingsKey,
        dek,
        versionCode: process.env.MESSAGE_MAPPINGS_VERSION_CODE,
      },
    })
  }

  async updateMessageMappings(mappings: string, mappingsKey: string): Promise<TMessageMappings> {
    const existing = await this.getMessageMappings()
    if (existing) {
      await this.prismaService.messageMapping.update({
        where: { id: existing.id },
        data: { mappings },
      })
      return existing
    }
    const dek = this.symmetricEncryptor.generateSecretKey()
    return await this.createMessageMappings(
      this.symmetricEncryptor.encrypt(mappings, dek),
      this.symmetricEncryptor.encrypt(mappingsKey, dek),
      this.symmetricEncryptor.encrypt(dek, process.env.MESSAGE_MAPPINGS_SECRET_KEY)
    )
  }
}
