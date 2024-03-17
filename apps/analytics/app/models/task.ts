import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare publicId: string

  @column()
  declare title: string

  @column()
  declare moneyCost: number

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime
}
