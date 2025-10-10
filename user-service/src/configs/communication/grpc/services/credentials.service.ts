import { CredentialsService as CredentialsServiceType } from 'protos/generated/auth'

export class CredentialsService {
  constructor(private instance: CredentialsServiceType) {}

  async compareHashedPassword(password: string, encrypted: string): Promise<boolean> {
    return (await this.instance.CompareHashedPassword({ password, encrypted })).isValid
  }

  async getHashedPassword(password: string): Promise<string> {
    return (await this.instance.GetHashedPassword({ plainPassword: password })).hashedPassword
  }
}
