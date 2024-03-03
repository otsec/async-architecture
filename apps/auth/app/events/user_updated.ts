import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'

export default class UserUpdated extends BaseEvent {
  constructor(public user: User) {
    super()
  }
}
