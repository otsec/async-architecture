import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import DailyUserStats from '#models/daily_user_stats'
import Task from '#models/task'

export default class HomeController {
  async index({ view }: HttpContext) {
    const users = await User.all()

    // prettier-ignore
    const tasks = await Task.query()
      .from(
        Task.query()
          .select(
            '*',
            db.raw('row_number() over (partition by DATE(completed_at) order by money_cost desc) rn'),
          )
          .whereNotNull('completed_at')
      )
      .where('rn', '=', 1)
      .pojo()

    // prettier-ignore
    const stats = await DailyUserStats.query()
      .select(
        'date',
        db.raw('sum(money_lost) - sum(money_earned) as management_earned')
      )
      .pojo()

    return view.render('pages/home', { users, tasks, stats })
  }
}
