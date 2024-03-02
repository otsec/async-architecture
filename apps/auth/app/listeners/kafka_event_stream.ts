import app from '@adonisjs/core/services/app'
import UserCreated from '#events/user_created'
import UserUpdated from '#events/user_updated'

export default class KafkaEventStream {
  async handle(event: unknown) {
    const producer = await app.container.make('kafka-producer')

    if (event instanceof UserCreated || event instanceof UserUpdated) {
      const user = event.user;

      const data = user.serialize()

      await producer.send({
        topic: 'default',
        messages: [
          { key: 'user_' + user.id, value: JSON.stringify(data) },
        ],
      })
    }
  }
}
