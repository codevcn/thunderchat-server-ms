import type { Empty } from 'protos/generated/google/protobuf/empty'
import type {
  DeleteFileByUrlRequest,
  DeleteGroupChatAvatarRequest,
  S3UploadService,
  UploadFileRequest,
  UploadFileResponse,
  UploadGroupChatAvatarRequest,
  UploadGroupChatAvatarResponse,
} from 'protos/generated/media'

export interface IUploadService extends S3UploadService {
  DeleteFileByUrl(request: DeleteFileByUrlRequest): Promise<Empty>
  UploadFile(request: UploadFileRequest): Promise<UploadFileResponse>
  UploadGroupChatAvatar(
    request: UploadGroupChatAvatarRequest
  ): Promise<UploadGroupChatAvatarResponse>
  DeleteGroupChatAvatar(request: DeleteGroupChatAvatarRequest): Promise<Empty>
}
