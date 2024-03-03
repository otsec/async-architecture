import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class HomeController {
  async index({ view }: HttpContext) {
    const users = await User.all()

    return view.render('pages/home', { users })
  }
}
