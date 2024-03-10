import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Task from '#models/task'

export default class HomeController {
  async index({ view }: HttpContext) {
    const users = await User.all()
    const tasks = await Task.query().preload('assignedTo').select()

    return view.render('pages/home', { users, tasks })
  }
}
