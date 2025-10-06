declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      HOST_ADDRESS: string
      PORT: string
      MEDIA_SERVICE_PORT: string
      CHAT_SERVICE_PORT: string
      GRPC_PORT: string
      DATABASE_URL: string
      CLIENT_HOST: string
      CLIENT_HOST_DEV: string
    }
  }
}

export {}
