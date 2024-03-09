import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Kafka, KafkaMessage } from 'kafkajs'
import busConfig from '#config/bus'
import { anyEventValidator } from '#validators/event_bus'
import User from '#models/user'
import SchemaRegistry from '@popug/schema-registry'

type UserCudPayload = {
  id: string
  email: string
  fullName: string
  role: string
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
    if (validated.name === 'UserCreated') {
      await this.assertValid(validated.name, validated.version, data)
      await this.handleUserCudEvent(validated.payload as UserCudPayload)
    } else if (validated.name === 'UserUpdated') {
      await this.assertValid(validated.name, validated.version, data)
      await this.handleUserCudEvent(validated.payload as UserCudPayload)
    } else {
      throw new Error(`Unknown event: ${validated.name}`)
    }
  }

  async handleError(e: Error, message: KafkaMessage) {
    console.error(e)

    try {
      const data = JSON.parse(message.value!.toString())
      console.log('message json', data)
    } catch {
      console.log('message string', message.value?.toString())
    }
  }

  async assertValid(eventName: string, eventVersion: number, messageBody: unknown) {
    const result = await SchemaRegistry.validate(eventName, eventVersion, messageBody)
    if (!result.valid) {
      console.error(`Invalid event ${eventName} v${eventVersion}`, result.errors)
      throw new Error(`Invalid event ${eventName} v${eventVersion}`)
    }
  }

  async handleUserCudEvent(data: UserCudPayload) {
    await User.updateOrCreate(
      {
        publicId: data.id,
      },
      {
        role: data.role,
        email: data.email,
        fullName: data.fullName,
      }
    )
  }
}
