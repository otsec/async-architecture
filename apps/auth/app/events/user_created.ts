import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'

export default class UserCreated extends BaseEvent {
  constructor(public user: User) {
    super()
  }
}
