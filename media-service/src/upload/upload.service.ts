import { Injectable, BadRequestException, Inject } from '@nestjs/common'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ThumbnailService } from './thumbnail.service'
import { Express } from 'express'
import type { TFileMetadata, TUploadResult } from './upload.type'
import { PrismaService } from '@/configs/db/prisma.service'
import { detectFileType, formatBytes, decodeMulterFileName } from '@/utils/helpers'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { DevLogger } from '@/dev/dev-logger'
import { EProviderTokens } from '@/utils/enums'
import type { TMessageMedia } from '@/utils/entities/message-media.entity'
import { S3FileService } from './s3-file.service'
import { createReadStream, readFileSync } from 'fs'
import { extname } from 'path'
import * as https from 'https'
import * as http from 'http'
import { FileEncryptionService } from './file-encryption.service'
import { SymmetricTextEncryptor } from '@/utils/crypto/symmetric-text-encryptor.crypto'
import { readFile } from 'fs/promises'

@Injectable()
export class UploadService {
  private symmetricTextEncryptor: SymmetricTextEncryptor
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private readonly groupChatAvatarFolder = 'system/group-chat'
  private readonly awsBucketName = process.env.AWS_BUCKET_NAME
  // Định nghĩa các loại file được phép upload
  private readonly allowedMimeTypes = {
    // Images
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'image/bmp': 'image',
    'image/svg+xml': 'image',
    'image/tiff': 'image',
    'image/heic': 'image',

    // Videos
    'video/mp4': 'video',
    'video/avi': 'video',
    'video/mov': 'video',
    'video/wmv': 'video',
    'video/mpeg': 'video',
    'video/webm': 'video',
    'video/3gpp': 'video',
    'video/x-matroska': 'video',
    'video/x-flv': 'video',

    // Documents
    'application/pdf': 'document',
    'application/msword': 'document', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document', // .docx
    'application/vnd.ms-excel': 'document', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document', // .xlsx
    'application/vnd.ms-powerpoint': 'document', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document', // .pptx
    'text/plain': 'document', // .txt
    'text/csv': 'document', // .csv
    'application/rtf': 'document', // .rtf
    'application/vnd.oasis.opendocument.text': 'document',
    'application/vnd.oasis.opendocument.spreadsheet': 'document',
    'application/vnd.oasis.opendocument.presentation': 'document',
    'application/zip': 'document',
    'application/x-compressed': 'document', // Alternative MIME type for ZIP files
    'application/x-zip-compressed': 'document', // Another alternative for ZIP
    'application/x-rar-compressed': 'document',
    'application/x-7z-compressed': 'document',
    'application/gzip': 'archive', // .gz
    'application/x-gzip': 'archive', // Alternative for .gz
    'application/x-tar': 'archive',
    'application/x-bzip2': 'archive', // .bz2 files
    'application/x-bzip': 'archive', // .bz files

    'text/html': 'document', // .html
    'application/json': 'document', // .json
    'text/markdown': 'document',

    // Audio
    'audio/mpeg': 'audio',
    'audio/mp3': 'audio',
    'audio/wav': 'audio',
    'audio/webm': 'audio',
    'audio/ogg': 'audio',
    'audio/aac': 'audio',
    'audio/flac': 'audio',
    'audio/mp4': 'audio',
  }
  // Map content types to extensions based on allowedMimeTypes
  private readonly contentTypeToExtension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff',
    'image/heic': 'heic',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'video/wmv': 'wmv',
    'video/mpeg': 'mpeg',
    'video/webm': 'webm',
    'video/3gpp': '3gp',
    'video/x-matroska': 'mkv',
    'video/x-flv': 'flv',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/mp4': 'm4a',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/rtf': 'rtf',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'application/vnd.oasis.opendocument.presentation': 'odp',
    'application/zip': 'zip',
    'application/x-compressed': 'zip', // Alternative MIME type for ZIP files
    'application/x-zip-compressed': 'zip', // Another alternative for ZIP
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/gzip': 'gz',
    'application/x-gzip': 'gz', // Alternative for .gz
    'application/x-tar': 'tar',
    'application/x-bzip2': 'bz2', // .bz2 files
    'application/x-bzip': 'bz', // .bz files
    'text/html': 'html',
    'application/json': 'json',
    'text/markdown': 'md',
  }
  // Map extensions to content types based on allowedMimeTypes
  private readonly extensionToContentType = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    tiff: 'image/tiff',
    heic: 'image/heic',
    mp4: 'video/mp4',
    avi: 'video/avi',
    mov: 'video/mov',
    wmv: 'video/wmv',
    mpeg: 'video/mpeg',
    webm: 'video/webm',
    '3gp': 'video/3gpp',
    mkv: 'video/x-matroska',
    flv: 'video/x-flv',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    webma: 'audio/webm',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odp: 'application/vnd.oasis.opendocument.presentation',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',
    bz: 'application/x-bzip',
    tar: 'application/x-tar',
    html: 'text/html',
    json: 'application/json',
    md: 'text/markdown',
  }

  constructor(
    private readonly thumbnailService: ThumbnailService,
    @Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService,
    private fileEncryptionService: FileEncryptionService,
    private s3FileService: S3FileService
  ) {
    this.symmetricTextEncryptor = new SymmetricTextEncryptor()
  }

  async updateMessageMediaThumbnail(
    messageMediaId: number,
    thumbnailUrl: string
  ): Promise<TMessageMedia> {
    const updatedMedia = await this.prismaService.messageMedia.update({
      where: { id: messageMediaId },
      data: { thumbnailUrl },
    })
    return updatedMedia
  }

  async createMessageMedia(
    uploadedFileUrl: string,
    file: Express.Multer.File,
    decodedOriginalName: string,
    originalDek: string
  ): Promise<TMessageMedia> {
    const messageMedia = await this.prismaService.messageMedia.create({
      data: {
        url: uploadedFileUrl,
        type: await detectFileType(file),
        fileName: this.symmetricTextEncryptor.encrypt(decodedOriginalName, originalDek),
        fileSize: file.size,
        thumbnailUrl: '',
        dek: this.symmetricTextEncryptor.encrypt(
          originalDek,
          process.env.MESSAGES_ENCRYPTION_SECRET_KEY
        ),
        dekVersionCode: process.env.MESSAGES_ENCRYPTION_VERSION_CODE,
      },
    })
    return messageMedia
  }

  async uploadFile(file: Express.Multer.File): Promise<TUploadResult> {
    // Kiểm tra loại file
    const fileType = this.allowedMimeTypes[file.mimetype]
    if (!fileType) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`)
    }

    // Kiểm tra kích thước file
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 50MB limit')
    }

    // Chuẩn hóa tên file
    const decodedOriginalName = decodeMulterFileName(file.originalname)
    const fileKey = decodedOriginalName.includes('/')
      ? decodedOriginalName
      : `${Date.now()}_${decodedOriginalName}`

    let uploadedFileUrl: string | null = null

    const dek = this.fileEncryptionService.generateEncryptionKey()
    const encryptedBuffer = this.fileEncryptionService.encryptBuffer(file.buffer, dek)
    try {
      await this.s3FileService.saveFile(
        fileKey,
        encryptedBuffer,
        decodedOriginalName,
        file.mimetype,
        file.size.toString()
      )

      // Tự build URL thay vì `data.Location` như v2
      uploadedFileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

      const messageMedia = await this.createMessageMedia(
        uploadedFileUrl,
        file,
        decodedOriginalName,
        dek
      )

      const result: TUploadResult = {
        id: messageMedia.id,
        url: messageMedia.url,
        fileType: messageMedia.type,
        fileName: messageMedia.fileName,
        fileSize: formatBytes(messageMedia.fileSize),
      }

      // Nếu là video → tạo thumbnail
      if (fileType === 'video') {
        try {
          let thumbnailUrl: string
          const existingThumbnail = await this.thumbnailService.checkThumbnailExists(fileKey)

          if (existingThumbnail) {
            thumbnailUrl = existingThumbnail
          } else {
            thumbnailUrl = await this.thumbnailService.generateVideoThumbnail(
              uploadedFileUrl,
              fileKey
            )
          }

          await this.updateMessageMediaThumbnail(messageMedia.id, thumbnailUrl)

          result.thumbnailUrl = thumbnailUrl
        } catch (error) {
          // Rollback video nếu lỗi
          await this.rollbackFileUpload(fileKey)
          throw new Error(`Failed to create thumbnail: ${error.message}`)
        }
      }

      return result
    } catch (error) {
      // Nếu có lỗi và file đã upload thì rollback
      if (uploadedFileUrl) {
        await this.rollbackFileUpload(fileKey)
      }
      throw error
    }
  }

  /**
   * Rollback: Xóa file đã upload lên S3
   */
  private async rollbackFileUpload(fileKey: string): Promise<void> {
    try {
      await this.s3FileService.deleteFileByKey(fileKey)
    } catch (error) {
      DevLogger.logError(`Rollback File Upload error: ${error.message}`)
      throw error
    }
  }

  /**
   * Xoá file bất kỳ trên S3 theo url
   */
  public async deleteFileByUrl(fileUrl: string): Promise<void> {
    try {
      await this.s3FileService.deleteFileByURL(fileUrl)
    } catch (error: any) {
      DevLogger.logError(`Delete File error: ${error.message}`)
      throw error
    }
  }

  /**
   * Upload report image to S3
   */
  async uploadReportImage(file: Express.Multer.File): Promise<{ url: string }> {
    // Create fileKey with report-image folder
    const originalName = file.originalname
    const timestamp = Date.now()
    const fileKey = `report-image/${timestamp}_${originalName}`

    // Create a modified file object with custom key
    const modifiedFile = {
      ...file,
      originalname: fileKey, // Override originalname to use our custom key
    }

    const result = await this.uploadFile(modifiedFile)
    return { url: result.url }
  }

  /**
   * Upload report message media to S3
   */
  async uploadReportMessageMedia(
    filePath: string,
    messageId: number,
    contentType: string
  ): Promise<{ url: string }> {
    const fileBuffer = await readFile(filePath)

    // Extract file extension from file path
    const fileExtension =
      extname(filePath).substring(1) || this.getExtensionFromContentType(contentType)
    const fileKey = `report-message/${Date.now()}_message-${messageId}.${fileExtension}`

    // Get proper content type based on file extension
    const properContentType = this.getContentTypeFromExtension(fileExtension) || contentType

    await this.s3FileService.saveFile(
      fileKey,
      fileBuffer,
      `message-${messageId}`,
      properContentType,
      fileBuffer.length.toString()
    )

    // Trả về URL public (nếu bucket public) hoặc URL dạng S3
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

    return { url: fileUrl }
  }

  /**
   * Download file from URL and upload to S3 as report message media (AWS SDK v3)
   */
  async uploadReportMessageFromUrl(
    fileUrl: string,
    messageId: number,
    contentType: string,
    retryCount: number = 0
  ): Promise<{ url: string }> {
    const maxRetries = 3
    const timeout = 30000 // 30s

    return new Promise((resolve, reject) => {
      const protocol = fileUrl.startsWith('https:') ? https : http

      const request = protocol.get(fileUrl, { timeout }, (response: any) => {
        if (response.statusCode !== 200) {
          const error = new Error(`Failed to download file: HTTP ${response.statusCode}`)
          if (retryCount < maxRetries) {
            setTimeout(
              () =>
                this.uploadReportMessageFromUrl(fileUrl, messageId, contentType, retryCount + 1)
                  .then(resolve)
                  .catch(reject),
              2000 * (retryCount + 1)
            )
            return
          }
          reject(error)
          return
        }

        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))

        response.on('end', async () => {
          try {
            const fileBuffer = Buffer.concat(chunks)

            // Lấy extension từ URL
            const urlParts = fileUrl.split('?')[0]
            const fileName = urlParts.split('/').pop() || 'file'
            const fileExtension = fileName.includes('.')
              ? fileName.split('.').pop() || this.getExtensionFromContentType(contentType)
              : this.getExtensionFromContentType(contentType)

            const fileKey = `report-message/${Date.now()}_message-${messageId}.${fileExtension}`
            const properContentType = this.getContentTypeFromExtension(fileExtension) || contentType

            const command = new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET!,
              Key: fileKey,
              Body: fileBuffer,
              ContentType: properContentType,
            })

            try {
              await this.s3FileService.saveFile(
                fileKey,
                fileBuffer,
                `message-${messageId}`,
                properContentType,
                fileBuffer.length.toString()
              )
            } catch (s3Error) {
              if (retryCount < maxRetries) {
                setTimeout(
                  () =>
                    this.uploadReportMessageFromUrl(fileUrl, messageId, contentType, retryCount + 1)
                      .then(resolve)
                      .catch(reject),
                  2000 * (retryCount + 1)
                )
                return
              }
              throw s3Error
            }

            const fileUrlResult = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
            console.log('✅ Downloaded and uploaded report message media:', fileUrlResult)
            resolve({ url: fileUrlResult })
          } catch (error) {
            reject(error)
          }
        })

        response.on('error', (error: any) => {
          const downloadError = new Error(`Failed to download file: ${error.message}`)
          if (retryCount < maxRetries) {
            setTimeout(
              () =>
                this.uploadReportMessageFromUrl(fileUrl, messageId, contentType, retryCount + 1)
                  .then(resolve)
                  .catch(reject),
              2000 * (retryCount + 1)
            )
            return
          }
          reject(downloadError)
        })
      })

      request.on('error', (error: any) => {
        const connectError = new Error(`Failed to connect to URL: ${error.message}`)
        if (retryCount < maxRetries) {
          setTimeout(
            () =>
              this.uploadReportMessageFromUrl(fileUrl, messageId, contentType, retryCount + 1)
                .then(resolve)
                .catch(reject),
            2000 * (retryCount + 1)
          )
          return
        }
        reject(connectError)
      })

      request.setTimeout(timeout, () => {
        request.destroy()
        const timeoutError = new Error(`Request timeout after ${timeout}ms`)
        if (retryCount < maxRetries) {
          setTimeout(
            () =>
              this.uploadReportMessageFromUrl(fileUrl, messageId, contentType, retryCount + 1)
                .then(resolve)
                .catch(reject),
            2000 * (retryCount + 1)
          )
          return
        }
        reject(timeoutError)
      })
    })
  }

  /**
   * Get file extension from content type
   */
  private getExtensionFromContentType(contentType: string): string {
    // Check if content type is in allowedMimeTypes
    if (this.allowedMimeTypes[contentType]) {
      return this.contentTypeToExtension[contentType] || 'bin'
    }
    return 'bin'
  }

  /**
   * Get content type from file extension
   */
  private getContentTypeFromExtension(extension: string): string {
    const contentType = this.extensionToContentType[extension.toLowerCase()]
    // Verify that the content type is in allowedMimeTypes
    if (contentType && this.allowedMimeTypes[contentType]) {
      return contentType
    }
    return 'application/octet-stream'
  }

  async uploadGroupChatAvatar(file: Express.Multer.File): Promise<{ url: string }> {
    const fileBuffer = await readFile(file.path)
    const uploadKey = `${this.groupChatAvatarFolder}/${Date.now()}-${S3FileService.hashFileName(file.originalname)}`
    await this.s3FileService.saveFile(
      uploadKey,
      fileBuffer,
      file.originalname,
      file.mimetype,
      file.size.toString()
    )
    return {
      url: `https://${this.awsBucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadKey}`,
    }
  }

  async deleteGroupChatAvatar(avatarUrl: string): Promise<void> {
    await this.s3FileService.deleteFileByKey(S3FileService.extractObjectKeyFromUrl(avatarUrl))
  }
}
