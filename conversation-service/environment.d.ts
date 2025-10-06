declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT: string
      GRPC_PORT: string
      SEARCH_SERVICE_PORT: string
      MEDIA_SERVICE_PORT: string
      HOST_ADDRESS: string
      DATABASE_URL: string
      CLIENT_HOST: string
      CLIENT_HOST_DEV: string
    }
  }
}

export {}
