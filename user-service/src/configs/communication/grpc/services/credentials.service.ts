import type { CredentialsService as CredentialsServiceType } from 'protos/generated/auth'
import { firstValueFrom } from 'rxjs'

export class CredentialsService {
  constructor(private instance: CredentialsServiceType) {}

  async compareHashedPassword(password: string, encrypted: string): Promise<boolean> {
    return (await firstValueFrom(this.instance.CompareHashedPassword({ password, encrypted })))
      .isValid
  }

  async getHashedPassword(password: string): Promise<string> {
    return (await firstValueFrom(this.instance.GetHashedPassword({ plainPassword: password })))
      .hashedPassword
  }
}
