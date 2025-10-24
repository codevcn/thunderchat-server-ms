import crypto from 'crypto'
import { pipeline } from 'stream/promises'
import { createReadStream, createWriteStream } from 'fs'
import { EMsgEncryptionAlgorithms } from '../enums'

/**
 * Class xử lý mã hóa/giải mã file với AES-256-GCM
 * Hỗ trợ: Stream processing, Buffer mode, Progress tracking
 */
export class SymmetricFileEncryptor {
  private readonly ALGORITHM = EMsgEncryptionAlgorithms.AES_256_GCM
  private readonly IV_LENGTH = 12
  private readonly AUTH_TAG_LENGTH = 16
  private readonly KEY_LENGTH = 32
  private readonly CHUNK_SIZE = 64 * 1024 // 64KB chunks

  constructor() {}

  /**
   * Tạo khóa mã hóa 256-bit (tương thích với SymmetricEncryptor)
   */
  generateEncryptionKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('base64')
  }

  createStreamEncryptor(encryptionKey: Buffer, iv: Buffer): crypto.DecipherGCM {
    return crypto.createDecipheriv(this.ALGORITHM, encryptionKey, iv)
  }
}
