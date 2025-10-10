import { Controller } from '@nestjs/common'
import { UploadService } from './upload.service'
import { Express } from 'express'
import type { IUploadGrpcController } from './upload.interface'
import { GrpcMethod } from '@nestjs/microservices'
import { EGrpcServices } from '@/utils/enums'
import { DeleteFileByUrlRequest } from 'protos/generated/media'

import {
  UploadFileRequest,
  UploadFileResponse,
  UploadGroupChatAvatarRequest,
  UploadGroupChatAvatarResponse,
  DeleteGroupChatAvatarRequest,
  UploadReportImageRequest,
  UploadReportImageResponse,
  UploadReportMessageMediaRequest,
  UploadReportMessageMediaResponse,
} from 'protos/generated/media'
import { convertUint8ArrayToMulterFile } from '@/utils/helpers'
import { S3UploadService } from './s3-upload.service'

@Controller()
export class UploadGrpcController implements IUploadGrpcController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly s3UploadService: S3UploadService
  ) {}

  @GrpcMethod(EGrpcServices.UPLOAD_SERVICE, 'DeleteFileByUrl')
  async DeleteFileByUrl(data: DeleteFileByUrlRequest): Promise<void> {
    await this.uploadService.deleteFileByUrl(data.url)
  }

  @GrpcMethod(EGrpcServices.UPLOAD_SERVICE, 'UploadFile')
  async UploadFile(data: UploadFileRequest): Promise<UploadFileResponse> {
    return {
      fileInfo: await this.uploadService.uploadFile(
        convertUint8ArrayToMulterFile(data.content, data.filename)
      ),
    }
  }

  @GrpcMethod(EGrpcServices.UPLOAD_SERVICE, 'UploadGroupChatAvatar')
  async UploadGroupChatAvatar(
    data: UploadGroupChatAvatarRequest
  ): Promise<UploadGroupChatAvatarResponse> {
    return await this.s3UploadService.uploadGroupChatAvatar(
      convertUint8ArrayToMulterFile(data.file, data.filename)
    )
  }

  @GrpcMethod(EGrpcServices.UPLOAD_SERVICE, 'DeleteGroupChatAvatar')
  async DeleteGroupChatAvatar(data: DeleteGroupChatAvatarRequest): Promise<void> {
    await this.s3UploadService.deleteGroupChatAvatar(data.avatarUrl)
  }

  @GrpcMethod(EGrpcServices.UPLOAD_SERVICE, 'UploadReportImage')
  async UploadReportImage(data: UploadReportImageRequest): Promise<UploadReportImageResponse> {
    return await this.uploadService.uploadReportImage(
      convertUint8ArrayToMulterFile(data.file, data.filename)
    )
  }

  @GrpcMethod(EGrpcServices.UPLOAD_SERVICE, 'UploadReportMessageMedia')
  async UploadReportMessageMedia(
    data: UploadReportMessageMediaRequest
  ): Promise<UploadReportMessageMediaResponse> {
    return await this.uploadService.uploadReportMessageMedia(
      data.filePath,
      data.messageId,
      data.contentType
    )
  }
}
