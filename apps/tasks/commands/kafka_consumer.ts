import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Kafka, KafkaMessage } from 'kafkajs'
import busConfig from '#config/bus'
import { anyEventValidator } from '#validators/event_bus'
import User from '#models/user'

type UserEvent = {
  name: 'UserCreated' | 'UserUpdated'
  payload: UserCudEventPayload
}

type UserCudEventPayload = {
  id: number
  role: 'admin' | 'accountant' | 'user' | 'disabled'
  firstName: string
  lastName: string
  email: string
}

export default class KafkaConsumer extends BaseCommand {
  static commandName = 'kafka:consumer'
  static description = 'Start event bus consumer'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    this.logger.info('Hello world from "KafkaConsumer"')

    const kafka = new Kafka(busConfig.kafka.client)

    const consumer = kafka.consumer({
      groupId: 'tasks-app',
    })

    await consumer.connect()

    await consumer.subscribe({
      topic: 'default',
      fromBeginning: true,
    })

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          await this.handleMessage(message)
        } catch (e) {
          await this.handleError(e as Error, message)
        }
      },
    })
  }

  async handleMessage(message: KafkaMessage) {
    if (!message.value) {
      throw new Error('Empty message')
    }

    const data = JSON.parse(message.value.toString())
    const validated = await anyEventValidator.validate(data)
    if (validated.name === 'UserCreated' || validated.name === 'UserUpdated') {
      await this.handleUserCudEvent(validated as UserEvent)
    } else {
      throw new Error(`Unknown event: ${validated.name}`)
    }
  }

  async handleError(e: Error, message: KafkaMessage) {
    console.error(e, 'message', message.value?.toString())
  }

  async handleUserCudEvent(event: UserEvent) {
    const { firstName, lastName } = event.payload
    const fullName = [firstName, lastName].filter((segment) => !!segment).join(' ')

    console.log('event', event.payload)

    await User.updateOrCreate(
      {
        id: event.payload.id,
      },
      {
        role: event.payload.role,
        email: event.payload.email,
        fullName: fullName,
      }
    )
  }
}
