import { Injectable } from '@nestjs/common'
import { createWorker, replaceHTMLTagInMessageContent, typeToRawObject } from '@/utils/helpers'
import { SyncDataToESWorkerMessageDTO } from './sync-data-to-ES.dto'
import type {
  TWorkerErrorCallback,
  TWorkerExitCallback,
  TWorkerResponseCallback,
} from '@/utils/types'
import { Worker } from 'worker_threads'
import path from 'path'
import { EWorkerEvents, ESyncDataToESWorkerType } from '@/utils/enums'
import { EMessageMediaTypes, EMessageTypes } from '@/message/message.enum'
import { ESMessageEncryptionService } from '../es-message-encryption.service'

@Injectable()
export class SyncDataToESService {
  private syncDataToESWorker: Worker

  constructor(private messageEncryptionService: ESMessageEncryptionService) {}

  initWorker() {
    if (this.syncDataToESWorker) return
    this.syncDataToESWorker = createWorker(path.join(__dirname, 'sync-data-to-ES.worker.js'))
  }

  terminateWorker() {
    this.syncDataToESWorker.terminate()
  }

  onWorkerExit(callback: TWorkerExitCallback) {
    this.syncDataToESWorker.on(EWorkerEvents.EXIT, callback)
    this.terminateWorker()
  }

  onWorkerError(callback: TWorkerErrorCallback) {
    this.syncDataToESWorker.on(EWorkerEvents.ERROR, callback)
    this.terminateWorker()
  }

  onWorkerMessage(callback: TWorkerResponseCallback<SyncDataToESWorkerMessageDTO>) {
    this.syncDataToESWorker.on(EWorkerEvents.MESSAGE, callback)
    this.terminateWorker()
  }

  async syncDataToES(data: SyncDataToESWorkerMessageDTO) {
    this.initWorker()
    const message = data.message
    if (message) {
      const { content } = message
      if (content) {
        const esMsgEncryptor = await this.messageEncryptionService.getESMessageEncryptor()
        const { type, Media } = message
        const convertedContent =
          type === EMessageTypes.MEDIA && Media && Media.type === EMessageMediaTypes.DOCUMENT
            ? Media.fileName || replaceHTMLTagInMessageContent(content)
            : replaceHTMLTagInMessageContent(content)
        message.content = esMsgEncryptor.encrypt(convertedContent)
        await this.messageEncryptionService.updateMessageMappings()
      }
    }
    this.syncDataToESWorker.postMessage(data)
  }

  async syncUsersAndMessagesDataToES() {
    this.syncDataToESWorker.postMessage(
      typeToRawObject<SyncDataToESWorkerMessageDTO>({
        type: ESyncDataToESWorkerType.ALL_USERS_AND_MESSAGES,
      })
    )
  }
}
