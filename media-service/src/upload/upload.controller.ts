import { Controller, Get, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import { Express } from 'express'
import type { IUploadController } from './upload.interface'
import { ERoutes } from '@/utils/enums'

@Controller(ERoutes.UPLOAD)
export class UploadController implements IUploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadFile(file)
    return result
  }

  @Post('/multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const result = await this.uploadService.uploadMultipleFiles(files)
    return result
  }

  @Get()
  async getHello() {
    return 'Hello from Media Service: ' + process.env.PORT
  }

  @Get('/reply')
  async getReply() {
    return 'Reply from Media Service: ' + process.env.PORT
  }
}
