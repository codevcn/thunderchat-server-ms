import { SymmetricFileEncryptor } from '@/utils/crypto/symmetric-file-encryptor.crypto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class FileEncryptionService {
  private fileEncryptor: SymmetricFileEncryptor

  constructor() {
    this.fileEncryptor = new SymmetricFileEncryptor()
  }

  generateEncryptionKey(): string {
    return this.fileEncryptor.generateSecretKey()
  }

  encryptBuffer(fileBuffer: Buffer, encryptionKey: string): Buffer {
    return this.fileEncryptor.encryptBuffer(fileBuffer, encryptionKey)
  }
}
