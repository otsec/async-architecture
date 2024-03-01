import NextAuth from 'next-auth'

export const authOptions = {
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
      profile(profile: { id: string }) {
        return {
          id: "1234",
          name: "test"
        }
      },
    }
  ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
