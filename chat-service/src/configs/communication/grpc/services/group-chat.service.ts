import { EGroupChatPermissions } from '@/group-chat/group-chat.enum'
import type { TCastedFieldObject } from '@/utils/types'
import type {
  CheckGroupChatPermissionResponse,
  GroupChatService as GroupChatServiceType,
} from 'protos/generated/conversation'

export class GroupChatService {
  constructor(private instance: GroupChatServiceType) {}

  async checkGroupChatPermission(
    groupChatId: number,
    permission: EGroupChatPermissions
  ): Promise<boolean> {
    return (
      (await this.instance.CheckGroupChatPermission({
        groupChatId,
        permission,
      })) as TCastedFieldObject<CheckGroupChatPermissionResponse, 'allowed', boolean>
    ).allowed
  }
}
