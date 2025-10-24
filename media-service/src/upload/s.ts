export class BrowserFileEncryptor {
  private readonly IV_LENGTH = 12
  private readonly AUTH_TAG_LENGTH = 16

  /**
   * Giải mã file trong browser
   */
  async decryptBuffer(encryptedBuffer: ArrayBuffer, encryptionKey: string): Promise<ArrayBuffer> {
    // Decode base64 key
    const keyData = this.base64ToArrayBuffer(encryptionKey)

    // Import key
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, [
      'decrypt',
    ])

    // Tách IV, AuthTag, Ciphertext
    const buffer = new Uint8Array(encryptedBuffer)
    const iv = buffer.slice(0, this.IV_LENGTH)
    const ciphertext = buffer.slice(this.IV_LENGTH)

    // Giải mã (GCM tự verify auth tag)
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      ciphertext
    )

    return decrypted
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }
}
