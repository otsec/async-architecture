import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id').notNullable().unique()
      table.string('title')
      table.integer('money_cost')
      table.timestamp('created_at')
      table.timestamp('completed_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
