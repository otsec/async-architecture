import env from '#start/env'
import { defineConfig } from '@adonisjs/ally'
import { PopugDriver } from '@popug/ally-custom-driver'

const allyConfig = defineConfig({
  popug: (ctx) =>
    new PopugDriver(ctx, {
      driver: 'popug_driver',
      clientId: env.get('POPUG_OAUTH_CLIENT_ID'),
      clientSecret: env.get('POPUG_OAUTH_SECRET_KEY'),
      authorizeUrl: env.get('POPUG_OAUTH_BASE_URL') + '/oauth/authorize',
      accessTokenUrl: env.get('POPUG_OAUTH_BASE_URL') + '/oauth/token',
      userInfoUrl: env.get('POPUG_OAUTH_BASE_URL') + '/oauth/userinfo',
      callbackUrl: env.get('APP_BASE_URL') + '/auth/callback',
    }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
