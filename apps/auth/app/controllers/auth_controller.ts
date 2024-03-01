import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async authenticate({ auth, request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.redirect().toRoute('auth.login')
  }
}
