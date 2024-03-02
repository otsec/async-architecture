import { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, updateUserValidator } from '#validators/user'
import User from '#models/user'

export default class UsersController {
  async index({ view }: HttpContext) {
    const users = await User.query().orderBy('id', 'desc').select()

    return view.render('users/index', { users })
  }

  async create({ view }: HttpContext) {
    return view.render('users/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    await User.create(payload)

    return response.redirect().toRoute('users.index')
  }

  async edit({ request, view }: HttpContext) {
    const user = await User.findByOrFail('id', request.param('id'))

    return view.render('users/edit', { user })
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)

    const user = await User.findByOrFail('id', request.param('id'))
    user.merge(payload)
    await user.save()

    return response.redirect().toRoute('users.index')
  }
}
