import { EGrpcServices } from '@/utils/enums'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateMessageMappingsRequest,
  UpdateMessageMappingsRequest,
} from 'protos/generated/conversation'
import { MessageMappingsService } from './message-mappings.service'
import type { IMessageMappingsGrpcController } from './message-mappings-grpc.interface'

@Controller()
export class MessageMappingsGrpcController implements IMessageMappingsGrpcController {
  constructor(private readonly messageMappingsService: MessageMappingsService) {}

  @GrpcMethod(EGrpcServices.MESSAGE_MAPPINGS_SERVICE, 'CreateMessageMappings')
  async createMessageMappings(request: CreateMessageMappingsRequest) {
    return {
      messageMappingsJson: JSON.stringify(
        await this.messageMappingsService.createMessageMappings(
          request.mappings,
          request.encryptionKey
        )
      ),
    }
  }

  @GrpcMethod(EGrpcServices.MESSAGE_MAPPINGS_SERVICE, 'GetMessageMappings')
  async getMessageMappings() {
    const messageMappings = await this.messageMappingsService.getMessageMappings()
    return {
      messageMappingsJson: messageMappings ? JSON.stringify(messageMappings) : undefined,
    }
  }

  @GrpcMethod(EGrpcServices.MESSAGE_MAPPINGS_SERVICE, 'UpdateMessageMappings')
  async updateMessageMappings(request: UpdateMessageMappingsRequest) {
    return {
      messageMappingsJson: JSON.stringify(
        await this.messageMappingsService.updateMessageMappings(
          request.mappings,
          request.encryptionKeyIfCreate
        )
      ),
    }
  }
}
