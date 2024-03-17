import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import SchemaRegistry, {
  BalanceReducedPayloadV1,
  BalanceIncreasedPayloadV1,
} from '@popug/schema-registry'
import busConfig from '#config/bus'
import BalanceReduced from '#events/balance_reduced'
import BalanceIncreased from '#events/balance_increased'

export default class KafkaEventStream {
  async handle(event: unknown) {
    console.log('send event', event)

    if (event instanceof BalanceReduced) {
      const transaction = event.transaction

      if (!transaction.owner) {
        await transaction.load('owner')
      }

      if (!transaction.task) {
        await transaction.load('task')
      }

      const payload: BalanceReducedPayloadV1 = {
        userId: transaction.owner.publicId,
        taskId: transaction.task.publicId,
        amount: -1 * transaction.amount,
      }

      await this.sendToKafka('BalanceReduced', 1, payload, '' + transaction.id)
    }

    if (event instanceof BalanceIncreased) {
      const transaction = event.transaction

      if (!transaction.owner) {
        await transaction.load('owner')
      }

      if (!transaction.task) {
        await transaction.load('task')
      }

      const payload: BalanceIncreasedPayloadV1 = {
        userId: transaction.owner.publicId,
        taskId: transaction.task.publicId,
        amount: transaction.amount,
      }

      await this.sendToKafka('BalanceIncreased', 1, payload, '' + transaction.id)
    }
  }

  async sendToKafka(name: string, version: number, payload: unknown, messageKey?: string) {
    const messageBody = {
      id: randomUUID(),
      name: name,
      version: version,
      producer: busConfig.producerName,
      ts: Date.now(),
      payload,
    }

    const result = await SchemaRegistry.validate(name, version, messageBody)
    if (!result.valid) {
      console.error(`Invalid event ${name} v${version}`, result.errors)
      throw new Error(`Invalid format of ${name} v${version}`)
    }

    const producer = await app.container.make('kafka-producer')
    await producer.send({
      topic: 'default',
      messages: [{ key: messageKey, value: JSON.stringify(messageBody) }],
    })
  }
}
