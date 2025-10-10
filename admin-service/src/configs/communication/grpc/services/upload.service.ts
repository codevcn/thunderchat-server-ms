import type { TUploadResult } from '@/upload/upload.type'
import type { TCastedFieldObject } from '@/utils/types'
import type { UploadService as UploadServiceType, UploadFileResponse } from 'protos/generated/media'

export class UploadService {
  constructor(private instance: UploadServiceType) {}

  async deleteFileByUrl(fileUrl: string): Promise<void> {
    await this.instance.DeleteFileByUrl({ url: fileUrl })
  }

  async uploadFile(file: Express.Multer.File): Promise<TUploadResult> {
    return (
      (await this.instance.UploadFile({
        content: file.buffer,
        filename: file.originalname,
      })) as TCastedFieldObject<UploadFileResponse, 'fileInfo', TUploadResult>
    ).fileInfo
  }
}
