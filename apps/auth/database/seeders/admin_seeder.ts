import { randomUUID } from 'node:crypto'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      publicId: randomUUID(),
      role: 'admin',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: null,
      password: 'admin',
    })
  }
}
