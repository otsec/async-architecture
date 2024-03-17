import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class DailyUserStats extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare date: string

  @column()
  declare userId: number

  @column()
  declare moneyLost: number

  @column()
  declare moneyEarned: number
}
