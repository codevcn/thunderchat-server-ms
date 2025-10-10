declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT: string
      GRPC_PORT: string
      HOST_ADDRESS: string
      DATABASE_URL: string
      CLIENT_HOST: string
      CLIENT_HOST_DEV: string
      VAPID_PUBLIC_KEY: string
      ELASTIC_API_KEY: string
      AUTH_SERVICE_PORT: string
      JWT_SECRET: string
      JWT_TOKEN_MAX_AGE_IN_HOUR: string
      CLIENT_DOMAIN: string
      CLIENT_DOMAIN_DEV: string
    }
  }
}

export {}
