import { plainToInstance } from 'class-transformer'
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator'
import { EEnvironments } from '../enums'

class EnvironmentVariables {
  @IsEnum(EEnvironments)
  NODE_ENV: EEnvironments

  @IsNumber()
  PORT: number

  @IsString()
  DATABASE_URL: string

  @IsString()
  AWS_ACCESS_KEY_ID: string

  @IsString()
  AWS_SECRET_ACCESS_KEY: string

  @IsString()
  AWS_REGION: string

  @IsString()
  AWS_BUCKET_NAME: string

  @IsString()
  AWS_ACCESS_KEY: string

  @IsString()
  AWS_SECRET_KEY: string

  @IsString()
  AWS_S3_BUCKET: string
}

export function envValidation(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })
  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
