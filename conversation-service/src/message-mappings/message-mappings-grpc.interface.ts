import type {
  CreateMessageMappingsRequest,
  CreateMessageMappingsResponse,
  GetMessageMappingsResponse,
  UpdateMessageMappingsRequest,
  UpdateMessageMappingsResponse,
} from 'protos/generated/conversation'

export interface IMessageMappingsGrpcController {
  createMessageMappings(
    payload: CreateMessageMappingsRequest
  ): Promise<CreateMessageMappingsResponse>
  getMessageMappings(): Promise<GetMessageMappingsResponse>
  updateMessageMappings(
    payload: UpdateMessageMappingsRequest
  ): Promise<UpdateMessageMappingsResponse>
}
