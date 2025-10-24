import { SymmetricTextEncryptor } from '@/utils/crypto/symmetric-text-encryptor.crypto'
import { Injectable } from '@nestjs/common'
import type { TMessage } from '@/utils/entities/message.entity'
import type { TEncryptMessageContentRes } from './encrypt-message.type'

@Injectable()
export class EncryptMessageService {
  private SymmetricTextEncryptor: SymmetricTextEncryptor

  constructor() {
    this.SymmetricTextEncryptor = new SymmetricTextEncryptor()
    console.log(
      '>>> SymmetricTextEncryptor initialized:',
      this.SymmetricTextEncryptor.generateEncryptionKey()
    )
  }

  private generateDEK(): string {
    return this.SymmetricTextEncryptor.generateEncryptionKey()
  }

  encryptMessageContent(originalContent: string): TEncryptMessageContentRes {
    if (originalContent) {
      const dek = this.generateDEK()
      const encryptedDek = this.SymmetricTextEncryptor.encrypt(
        dek,
        process.env.MESSAGES_ENCRYPTION_SECRET_KEY
      )
      return {
        encryptedContent: this.SymmetricTextEncryptor.encrypt(originalContent, dek),
        encryptedDek,
      }
    }
    return { encryptedContent: '', encryptedDek: '' }
  }

  decryptMessageContent(encryptedContent: string, dek: string): string {
    return encryptedContent
      ? this.SymmetricTextEncryptor.decrypt(
          encryptedContent,
          this.SymmetricTextEncryptor.decrypt(dek, process.env.MESSAGES_ENCRYPTION_SECRET_KEY)
        )
      : ''
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
