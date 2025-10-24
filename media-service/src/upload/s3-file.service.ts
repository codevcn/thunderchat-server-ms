import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { DeleteObjectCommandOutput, PutObjectCommandOutput } from '@aws-sdk/client-s3'
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import crypto from 'crypto'
import type { TFileMetadata } from './upload.type'
import { EProviderTokens } from '@/utils/enums'
import { PrismaClient } from '@prisma/client'
import stream from 'stream'
import { Response } from 'express'
import { SymmetricFileEncryptor } from '@/utils/crypto/symmetric-file-encryptor.crypto'

@Injectable()
export class S3FileService {
  private s3Client: S3Client
  private fileEncryptor: SymmetricFileEncryptor

  constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaClient: PrismaClient) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    })
    this.fileEncryptor = new SymmetricFileEncryptor()
  }

  static hashFileName(fileName: string, fileNameLength: number = 16) {
    return crypto.createHash('sha256').update(fileName).digest('hex').slice(0, fileNameLength)
  }

  static extractObjectKeyFromUrl(url: string) {
    return url.split('.amazonaws.com/')[1]
  }

  private getS3BucketName(): string {
    return process.env.AWS_S3_BUCKET
  }

  private createFileMetadata(
    originalFileName: string,
    fileMimeType: string,
    fileSize: string
  ): TFileMetadata {
    return {
      'original-filename': originalFileName,
      'original-mimetype': fileMimeType,
      'original-size': fileSize,
      encrypted: 'true',
    }
  }

  async deleteFileByKey(fileKey: string): Promise<DeleteObjectCommandOutput> {
    return await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.getS3BucketName(),
        Key: fileKey,
      })
    )
  }

  async deleteFileByURL(fileUrl: string): Promise<DeleteObjectCommandOutput> {
    const objectKey = fileUrl.split('.amazonaws.com/')[1]
    if (!objectKey) {
      throw new Error('Invalid file URL!')
    }
    return await this.deleteFileByKey(objectKey)
  }

  async saveFile(
    fileKey: string,
    fileBuffer: Buffer,
    originalFileName: string,
    fileMimeType: string,
    fileSize: string
  ): Promise<PutObjectCommandOutput> {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.getS3BucketName(),
        Key: fileKey,
        Body: fileBuffer,
        ContentType: fileMimeType,
        Metadata: this.createFileMetadata(originalFileName, fileMimeType, fileSize),
      })
    )
  }

  async fetchFileMetadata(fileKey: string): Promise<TFileMetadata | null> {
    const headResponse = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.getS3BucketName(),
        Key: fileKey,
      })
    )
    return headResponse.Metadata as TFileMetadata
  }

  async getFileFromURL(url: string, res: Response): Promise<void> {
    const msgMedia = await this.prismaClient.messageMedia.findUnique({ where: { url } })
    if (!msgMedia) {
      throw new NotFoundException('MessageMedia not found')
    }
    let s3Stream: NodeJS.ReadableStream
    let metadata: TFileMetadata
    try {
      // Lấy object stream từ S3
      const s3Response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.getS3BucketName(),
          Key: S3FileService.extractObjectKeyFromUrl(url),
        })
      )
      s3Stream = s3Response.Body as NodeJS.ReadableStream
      metadata = s3Response.Metadata as TFileMetadata
    } catch (error) {
      console.error('>>> S3 error:', error)
      res.status(500).json({ error: error.message })
      return
    }
    // Ensure s3Stream is a Node.js Readable stream
    if (!s3Stream || typeof (s3Stream as any).pipe !== 'function') {
      throw new InternalServerErrorException('S3 response body is not a readable stream')
    }
    if (
      !metadata ||
      !metadata['original-filename'] ||
      !metadata['original-mimetype'] ||
      !metadata['original-size']
    ) {
      throw new InternalServerErrorException('Missing file metadata')
    }

    // Tạo decipher stream
    const decipher = this.fileEncryptor.createStreamEncryptor(
      Buffer.from(msgMedia.dek), // 32 bytes
      Buffer.from(msgMedia.iv) // 16 bytes
    )

    // Set headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="decrypted.pdf"')

    // Pipeline: S3 Stream -> Decipher -> Response
    stream.pipeline(s3Stream as NodeJS.ReadableStream, decipher, res, (error) => {
      if (error) {
        console.error('>>> Pipeline error:', error)
        if (!res.headersSent) {
          res.status(500).send('Decryption failed')
        }
      }
    })
  }
}
