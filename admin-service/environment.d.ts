declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      HOST_ADDRESS: string
      PORT: string
      UPLOAD_REMOTE_PORT: string
      USER_CONNECTION_REMOTE_PORT: string
      GRPC_PORT: string
      DATABASE_URL: string
      CLIENT_HOST: string
      CLIENT_HOST_DEV: string
    }
  }
}

export {}
