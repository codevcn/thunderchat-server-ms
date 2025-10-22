import { Inject, Injectable } from '@nestjs/common'
import { MessageMappingsService } from '../communication/grpc/services/message-mappings.service'
import ESMessageEncryptor from '@/message/security/es-message-encryptor'
import { EGrpcPackages, EGrpcServices } from '@/utils/enums'
import { ClientGrpc } from '@nestjs/microservices'
import { SymmetricEncryptor } from '@/utils/crypto/symmetric-encryption.crypto'

@Injectable()
export class ESMessageEncryptionService {
  private ESMsgEncryptor: ESMessageEncryptor | null = null
  private messageMappingService: MessageMappingsService

  constructor(
    @Inject(EGrpcPackages.CONVERSATION_PACKAGE) private readonly conversationClient: ClientGrpc
  ) {
    this.messageMappingService = new MessageMappingsService(
      this.conversationClient.getService(EGrpcServices.MESSAGE_MAPPINGS_SERVICE)
    )
  }

  async getESMessageEncryptor(): Promise<ESMessageEncryptor> {
    if (this.ESMsgEncryptor) return this.ESMsgEncryptor
    return await this.initESMessageEncryptor()
  }

  private async initESMessageEncryptor(): Promise<ESMessageEncryptor> {
    let messageMapping = await this.messageMappingService.getMessageMappings()
    const symmetricEncryptor = new SymmetricEncryptor()
    if (messageMapping) {
      const { mappings, key } = messageMapping
      this.ESMsgEncryptor = new ESMessageEncryptor(key, symmetricEncryptor.decrypt(mappings, key))
      return this.ESMsgEncryptor
    }
    this.ESMsgEncryptor = new ESMessageEncryptor(
      ESMessageEncryptor.generateESMessageSecretKey(),
      null
    )
    return this.ESMsgEncryptor
  }

  async encryptTextByESEncryptor(text: string): Promise<string> {
    if (!this.ESMsgEncryptor) {
      this.ESMsgEncryptor = await this.initESMessageEncryptor()
    }
    return this.ESMsgEncryptor.encrypt(text)
  }

  async updateMessageMappings(): Promise<void> {
    if (this.ESMsgEncryptor) {
      await this.messageMappingService.updateMessageMappings(
        this.ESMsgEncryptor.getMappings(),
        this.ESMsgEncryptor.getSecretKey()
      )
    }
  }
}
