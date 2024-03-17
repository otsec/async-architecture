import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Transaction from '#models/transaction'

export default class HomeController {
  async index({ view }: HttpContext) {
    const users = await User.all()

    const transactions = await Transaction.query()
      .preload('owner')
      .preload('task')
      .orderBy('created_at', 'desc')
      .select()

    return view.render('pages/home', { users, transactions })
  }
}
