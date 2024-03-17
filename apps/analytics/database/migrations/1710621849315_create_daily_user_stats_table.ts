import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_user_stats'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.date('date').notNullable()
      table.integer('user_id').notNullable()
      table.integer('money_lost').notNullable().defaultTo(0)
      table.integer('money_earned').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
