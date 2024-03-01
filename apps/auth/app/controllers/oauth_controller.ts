import { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'

export default class OauthController {
 async authorize({ request, response }: HttpContext) {
   console.log('authorize req', request.all())

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
   const code = randomUUID()

   const url = new URL(redirectUrl)
   url.searchParams.set('state', state)
   url.searchParams.set('code', code)
   console.log('redirect url', url.toString())

   return response.redirect(url.toString())
 }

  async token({ request }: HttpContext) {
    console.log('token req', request.all())

    // req {
    //   grant_type: 'authorization_code',
    //   code: '919b38db-25ac-49f7-b0fd-621dc202d637',
    //   redirect_uri: 'http://localhost:3000/api/auth/callback/custom'
    // }
    // {
    //   "access_token":"2YotnFZFEjr1zCsicMWpAA",
    //   "token_type":"example",
    //   "expires_in":3600,
    //   "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
    //   "example_parameter":"example_value"
    // }

    return {
      access_token: randomUUID(),
      expires_in: 3600,
      refresh_token: randomUUID(),
    }
  }

  async userInfo({ request }: HttpContext) {
    console.log('userInfo req', request.all(), request.headers())

    return {
      id: 1,
    }
  }
}
