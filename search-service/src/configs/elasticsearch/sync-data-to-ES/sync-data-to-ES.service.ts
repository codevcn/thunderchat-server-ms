import { Inject, Injectable } from '@nestjs/common'
import { createWorker, replaceHTMLTagInMessageContent, typeToRawObject } from '@/utils/helpers'
import { SyncDataToESWorkerMessageDTO } from './sync-data-to-ES.dto'
import type {
  TWorkerErrorCallback,
  TWorkerExitCallback,
  TWorkerResponseCallback,
} from '@/utils/types'
import { Worker } from 'worker_threads'
import path from 'path'
import { TUserId } from '@/user/user.type'
import { ESyncDataToESMessages } from './sync-data-to-ES.message'
import { SymmetricEncryptor } from '@/utils/crypto/symmetric-encryption.crypto'
import ESMessageEncryptor from '@/message/security/es-message-encryptor'
import { EWorkerEvents, ESyncDataToESWorkerType, EGrpcPackages, EGrpcServices } from '@/utils/enums'
import { SystemException } from '@/utils/exceptions/system.exception'
import { ClientGrpc } from '@nestjs/microservices'
import { MessageMappingsService } from '@/configs/communication/grpc/services/message-mappings.service'
import { EMessageMediaTypes, EMessageTypes } from '@/message/message.enum'

@Injectable()
export class SyncDataToESService {
  private readonly ESMsgEncryptors: Map<TUserId, ESMessageEncryptor> = new Map()
  private syncDataToESWorker: Worker
  private messageMappingService: MessageMappingsService

  constructor(
    @Inject(EGrpcPackages.CONVERSATION_PACKAGE) private readonly conversationClient: ClientGrpc
  ) {
    this.messageMappingService = new MessageMappingsService(
      this.conversationClient.getService(EGrpcServices.MESSAGE_MAPPINGS_SERVICE)
    )
  }

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
        const { authorId } = message
        const esMsgEncryptor = this.getESMessageEncryptor(authorId)
        if (!esMsgEncryptor) {
          throw new SystemException(ESyncDataToESMessages.ES_MESSAGE_ENCRYPTOR_NOT_FOUND)
        }
        const { type, Media } = message
        const convertedContent =
          type === EMessageTypes.MEDIA && Media && Media.type === EMessageMediaTypes.DOCUMENT
            ? Media.fileName || replaceHTMLTagInMessageContent(content)
            : replaceHTMLTagInMessageContent(content)
        message.content = esMsgEncryptor.encrypt(convertedContent)
      }
    }
    this.syncDataToESWorker.postMessage(data)
  }

  async initESMessageEncryptorByUser(userId: TUserId): Promise<void> {
    const messageMapping = await this.messageMappingService.findMessageMappings(userId)
    if (!messageMapping) {
      throw new SystemException(ESyncDataToESMessages.MESSAGE_MAPPING_NOT_FOUND)
    }
    const symmetricEncryptor = new SymmetricEncryptor()
    const { mappings, key } = messageMapping
    const decryptedMappings = mappings ? symmetricEncryptor.decrypt(mappings, key) : null
    this.ESMsgEncryptors.set(userId, new ESMessageEncryptor(key, decryptedMappings))
  }

  getESMessageEncryptor(userId: TUserId): ESMessageEncryptor | undefined {
    return this.ESMsgEncryptors.get(userId)
  }

  getUserSecretKey(userId: TUserId): string | undefined {
    return this.ESMsgEncryptors.get(userId)?.getSecretKey()
  }

  async syncUsersAndMessagesDataToES() {
    this.syncDataToESWorker.postMessage(
      typeToRawObject<SyncDataToESWorkerMessageDTO>({
        type: ESyncDataToESWorkerType.ALL_USERS_AND_MESSAGES,
      })
    )
  }
}
