import { BaseEvent } from '@adonisjs/core/events'
import Transaction from '#models/transaction'

export default class BalanceIncreased extends BaseEvent {
  constructor(public transaction: Transaction) {
    super()
  }
}
