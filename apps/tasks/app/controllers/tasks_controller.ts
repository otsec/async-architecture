import { randomUUID } from 'node:crypto'
import sample from 'lodash/fp/sample.js'
import { HttpContext } from '@adonisjs/core/http'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import Task from '#models/task'
import User from '#models/user'
import TaskCreated from '#events/task_created'
import TaskUpdated from '#events/task_updated'
import TaskCompleted from '#events/task_completed'
import TaskReassigned from '#events/task_reassigned'

export default class TasksController {
  async index({ view }: HttpContext) {
    const tasks = await Task.query().preload('assignedTo').where('isCompleted', false).select()

    return view.render('tasks/index', { tasks })
  }

  async create({ view }: HttpContext) {
    return view.render('tasks/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTaskValidator)

    const workers = await User.query().where('role', 'user').select()
    if (workers.length === 0) {
      throw new Error('No available workers found')
    }

    const worker = sample(workers)!

    const task = new Task()
    task.fill(payload)
    task.publicId = randomUUID()
    task.assignedToId = worker.id
    await task.save()

    await TaskCreated.dispatch(task)

    return response.redirect().toRoute('tasks.index')
  }

  async shuffle({ response }: HttpContext) {
    const tasks = await Task.query().where('isCompleted', false).select()

    const workers = await User.query().where('role', 'user').select()
    if (workers.length === 0) {
      throw new Error('No available workers found')
    }

    for (const task of tasks) {
      const randomWorker = sample(workers)!
      if (task.assignedToId !== randomWorker.id) {
        task.assignedToId = randomWorker.id
        await task.save()

        await TaskReassigned.dispatch(task)
      }
    }

    return response.redirect().toRoute('tasks.index')
  }

  async edit({ request, view }: HttpContext) {
    const task = await Task.findByOrFail('id', request.param('id'))

    return view.render('tasks/edit', { task })
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateTaskValidator)

    const task = await Task.findByOrFail('id', request.param('id'))
    task.merge(payload)
    await task.save()

    await TaskUpdated.dispatch(task)

    return response.redirect().toRoute('tasks.index')
  }

  async complete({ request, response }: HttpContext) {
    const task = await Task.findByOrFail('id', request.param('id'))
    task.isCompleted = true
    await task.save()

    await TaskCompleted.dispatch(task)

    return response.redirect().toRoute('tasks.index')
  }
}
