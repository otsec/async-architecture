import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import busConfig from '#config/bus'
import UserCreated from '#events/user_created'
import UserUpdated from '#events/user_updated'
import SchemaRegistry from '@popug/schema-registry'

export default class KafkaEventStream {
  async handle(event: unknown) {
    if (event instanceof UserCreated) {
      const user = event.user

      let payload = {
        id: user.publicId,
        email: user.email,
        fullName: user.fullName(),
        role: user.role,
      }
      await this.sendToKafka('UserCreated', 1, payload, '' + user.id)
    }

    if (event instanceof UserUpdated) {
      const user = event.user

      const payload = {
        id: user.publicId,
        email: user.email,
        fullName: user.fullName(),
        role: user.role,
      }
      await this.sendToKafka('UserUpdated', 1, payload, '' + user.id)
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
