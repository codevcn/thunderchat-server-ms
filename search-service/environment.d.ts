declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT: string
      CHAT_SERVICE_PORT: string
      CONVERSATION_SERVICE_PORT: string
      USER_SERVICE_PORT: string
      DATABASE_URL: string
      CLIENT_HOST: string
      CLIENT_HOST_DEV: string
      ELASTIC_API_KEY: string
      DECRYPT_USER_KEY_MASTER_KEY: string
      ELASTICSEARCH_URL: string
    }
  }
}

export {}
