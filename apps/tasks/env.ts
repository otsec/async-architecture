import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    POPUG_OAUTH_BASE_URL: z.string(),
    POPUG_OAUTH_CLIENT_ID: z.string(),
    POPUG_OAUTH_SECRET_KEY: z.string(),
    DATABASE_URL: z.string(),
    KAFKA_BROKER_1: z.string(),
  },
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POPUG_OAUTH_BASE_URL: process.env.POPUG_OAUTH_BASE_URL,
    POPUG_OAUTH_CLIENT_ID: process.env.POPUG_OAUTH_CLIENT_ID,
    POPUG_OAUTH_SECRET_KEY: process.env.POPUG_OAUTH_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    KAFKA_BROKER_1: process.env.KAFKA_BROKER_1,
  },
})
