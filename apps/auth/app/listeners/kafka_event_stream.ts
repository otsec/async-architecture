import app from '@adonisjs/core/services/app'
import UserCreated from '#events/user_created'
import UserUpdated from '#events/user_updated'

export default class KafkaEventStream {
  async handle(event: unknown) {
    const producer = await app.container.make('kafka-producer')

    if (event instanceof UserCreated || event instanceof UserUpdated) {
      const eventName = event.constructor.name
      const user = event.user;

      const messageKey = `${eventName}_${user.id}`
      const messageValueJson = {
        name: eventName,
        payload: user.serialize(),
      }

      await producer.send({
        topic: 'default',
        messages: [
          {
            key: messageKey,
            value: JSON.stringify(messageValueJson),
          }
        ],
      })
    }
  }
}
