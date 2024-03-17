import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class OauthController {
  async authorize({ auth, request, response }: HttpContext) {
    console.log('authorize req', request.all())

    await auth.authenticate()

    // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1
    //  req {
    //   client_id: 'tasks-tracker',
    //   scope: 'openid',
    //   response_type: 'code',
    //   redirect_uri: 'http://localhost:3000/api/auth/callback/custom',
    //   state: 'XuSixKcYQCcWq2sS6HBQLqJf81pTNyyA9x2aZCgdiR8'
    // }
    // res -> redirect with state and code

    const redirectUrl = request.qs()['redirect_uri']
    const state = request.qs()['state']
    const code = `authorization_code_${auth.user!.id}`

    const url = new URL(redirectUrl)
    url.searchParams.set('state', state)
    url.searchParams.set('code', code)
    console.log('redirect url', url.toString())

    return response.redirect(url.toString())
  }

  async token({ request }: HttpContext) {
    console.log('token req', request.all())

    // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
    // req {
    //   grant_type: 'authorization_code',
    //   code: '919b38db-25ac-49f7-b0fd-621dc202d637',
    //   redirect_uri: 'http://localhost:3000/api/auth/callback/custom'
    // }

    const { code } = request.all()

    const payload = this.verifyToken(code)
    if (payload?.type !== 'authorization_code') {
      throw new Error('invalid authorization code')
    }

    // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.4
    // res {
    //   "access_token":"2YotnFZFEjr1zCsicMWpAA",
    //   "token_type":"example",
    //   "expires_in":3600,
    //   "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
    //   "example_parameter":"example_value"
    // }

    console.log('token res', {
      access_token: `access_token_${payload.userId}`,
      expires_in: 3600,
      refresh_token: `refresh_token_${payload.userId}`,
    })

    return {
      access_token: `access_token_${payload.userId}`,
      expires_in: 3600,
      refresh_token: `refresh_token_${payload.userId}`,
    }
  }

  async userInfo({ request }: HttpContext) {
    console.log('userInfo req', request.all(), request.headers())

    const authHeader = request.header('authorization')
    if (!authHeader) {
      throw new Error('unauthorized access')
    }

    const [, token] = authHeader.split('Bearer ')
    if (!token) {
      throw new Error('unauthorized access')
    }

    const payload = this.verifyToken(token)
    if (payload?.type !== 'access_token') {
      throw new Error('Unauthorized access')
    }

    const user = await User.findByOrFail('id', payload.userId)

    return user.serialize()
  }

  verifyToken(token: string) {
    if (token.startsWith('authorization_code_')) {
      const userId = token.replace('authorization_code_', '')
      return { type: 'authorization_code', userId: Number.parseInt(userId, 10) }
    }

    if (token.startsWith('access_token_')) {
      const userId = token.replace('access_token_', '')
      return { type: 'access_token', userId: Number.parseInt(userId, 10) }
    }

    if (token.startsWith('refresh_token_')) {
      const userId = token.replace('refresh_token_', '')
      return { type: 'refresh_token', userId: Number.parseInt(userId, 10) }
    }

    return null
  }
}
