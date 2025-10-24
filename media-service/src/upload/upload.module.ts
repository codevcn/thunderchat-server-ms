import { Module } from '@nestjs/common'
import { UploadService } from './upload.service'
import { UploadController } from './upload.controller'
import { ThumbnailService } from './thumbnail.service'
import { S3FileService } from './s3-file.service'
import { FileEncryptionService } from './file-encryption.service'

@Module({
  controllers: [UploadController],
  providers: [UploadService, ThumbnailService, S3FileService, FileEncryptionService],
})
export class UploadModule {}
