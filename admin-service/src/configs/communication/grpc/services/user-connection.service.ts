import type { UserConnectionService as UserConnectionServiceType } from 'protos/generated/chat'

export class UserConnectionService {
  constructor(private instance: UserConnectionServiceType) {}

  async getConnectedClientsCountForAdmin(): Promise<number> {
    return (await this.instance.GetConnectedClientsCountForAdmin({})).count
  }
}
