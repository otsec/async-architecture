import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id').notNullable().unique()
      table.integer('created_by_id').unsigned().references('id').inTable('users')
      table.integer('assigned_to_id').unsigned().references('id').inTable('users')
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.boolean('is_completed').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
