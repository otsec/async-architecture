import { BaseEvent } from '@adonisjs/core/events'
import Task from '#models/task'

export default class TaskCompleted extends BaseEvent {
  constructor(public task: Task) {
    super()
  }
}
