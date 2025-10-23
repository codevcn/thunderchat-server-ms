import { SymmetricEncryptor } from '@/utils/crypto/symmetric-encryption.crypto'
import { Injectable } from '@nestjs/common'
import type { TMessage } from '@/utils/entities/message.entity'
import type { TEncryptMessageContentRes } from './encrypt-message.type'

@Injectable()
export class EncryptMessageService {
  private symmetricEncryptor: SymmetricEncryptor

  constructor() {
    this.symmetricEncryptor = new SymmetricEncryptor()
  }

  private generateDEK(): string {
    return this.symmetricEncryptor.generateSecretKey()
  }

  encryptMessageContent(originalContent: string): TEncryptMessageContentRes {
    if (originalContent) {
      const dek = this.generateDEK()
      const encryptedDek = this.symmetricEncryptor.encrypt(
        dek,
        process.env.MESSAGES_ENCRYPTION_SECRET_KEY
      )
      return {
        encryptedContent: this.symmetricEncryptor.encrypt(originalContent, dek),
        encryptedDek,
      }
    }
    return { encryptedContent: '', encryptedDek: '' }
  }

  decryptMessageContent(encryptedContent: string, dek: string): string {
    return encryptedContent ? this.symmetricEncryptor.decrypt(encryptedContent, dek) : ''
  }

  decryptMessage<Message extends TMessage>(message: Message): Message {
    return {
      ...message,
      content: this.decryptMessageContent(message.content, message.dek),
    }
  }

  decryptMessages<Message extends TMessage>(messages: Message[]): Message[] {
    return messages.map((msg) => {
      return { ...msg, content: this.decryptMessageContent(msg.content, msg.dek) }
    })
  }
}
