import { Controller } from '@nestjs/common'
import { MessageService } from './message.service'
import type { IMessageGrpcController } from './message.interface'
import { TFindMessagesForGlobalSearchPayload } from './message.type'

@Controller()
export class MessageGrpcController implements IMessageGrpcController {
  constructor(private messageService: MessageService) {}

  async findMessagesForGlobalSearch(data: TFindMessagesForGlobalSearchPayload) {
    const messages = await this.messageService.findMessagesForGlobalSearch(data.ids, data.limit)
    return { messages }
  }
}
