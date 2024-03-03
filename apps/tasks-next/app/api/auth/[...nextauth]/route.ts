import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'custom',
      name: 'CustomOauthProvider',
      type: 'oauth' as const,
      clientId: process.env.POPUG_OAUTH_CLIENT_ID!,
      clientSecret: process.env.POPUG_OAUTH_SECRET_KEY!,
      authorization: `${process.env.POPUG_OAUTH_BASE_URL}/oauth/authorize`,
      token: `${process.env.POPUG_OAUTH_BASE_URL}/oauth/token`,
      userinfo: `${process.env.POPUG_OAUTH_BASE_URL}/oauth/userinfo`,
      profile(profile: any) {
        return profile
      },
    }
  ],
} as any

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
