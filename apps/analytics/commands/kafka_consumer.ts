import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Kafka, KafkaMessage } from 'kafkajs'
import { DateTime } from 'luxon'
import SchemaRegistry, {
  UserCreatedPayloadV1,
  UserUpdatedPayloadV1,
  TaskCreatedPayloadV1,
  TaskUpdatedPayloadV1,
  TaskCompletedPayloadV1,
  BalanceReducedPayloadV1,
  BalanceIncreasedPayloadV1,
  ValidEvent,
} from '@popug/schema-registry'
import busConfig from '#config/bus'
import { anyEventValidator } from '#validators/event_bus'
import User from '#models/user'
import Task from '#models/task'
import DailyUserStats from '#models/daily_user_stats'

export default class KafkaConsumer extends BaseCommand {
  static commandName = 'kafka:consumer'
  static description = 'Start event bus consumer'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    const kafka = new Kafka(busConfig.kafka.client)
    const consumer = kafka.consumer(busConfig.kafka.consumer)

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
    await this.assertValid(validated.name, validated.version, data)
    const event = validated as ValidEvent

    // prettier-ignore
    const ignoredEvents = [
      'TaskReassigned',
    ]
    if (ignoredEvents.includes(event.name)) {
      return
    }

    if (event.name === 'UserCreated' && event.version === 1) {
      await this.handleUserCudEvent(event.payload)
    } else if (event.name === 'UserUpdated' && event.version === 1) {
      await this.handleUserCudEvent(event.payload)
    } else if (event.name === 'TaskCreated' && event.version === 1) {
      await this.handleTaskCreatedEvent(event.payload, event)
    } else if (event.name === 'TaskUpdated' && event.version === 1) {
      await this.handleTaskUpdatedEvent(event.payload)
    } else if (event.name === 'TaskCompleted' && event.version === 1) {
      await this.handleTaskCompletedEvent(event.payload, event)
    } else if (event.name === 'BalanceReduced' && event.version === 1) {
      await this.handleBalanceReducedEvent(event.payload, event)
    } else if (event.name === 'BalanceIncreased' && event.version === 1) {
      await this.handleBalanceIncreasedEvent(event.payload, event)
    } else {
      throw new Error(`Unknown event: ${event.name}`)
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

  async handleUserCudEvent(data: UserCreatedPayloadV1 | UserUpdatedPayloadV1) {
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

  async handleTaskCreatedEvent(data: TaskCreatedPayloadV1, rawEvent: ValidEvent) {
    await Task.updateOrCreate(
      {
        publicId: data.id,
      },
      {
        title: data.title,
        createdAt: DateTime.fromMillis(rawEvent.ts),
      }
    )
  }

  async handleTaskUpdatedEvent(data: TaskUpdatedPayloadV1) {
    await Task.updateOrCreate(
      {
        publicId: data.id,
      },
      {
        title: data.title,
      }
    )
  }

  async handleTaskCompletedEvent(data: TaskCompletedPayloadV1, rawEvent: ValidEvent) {
    await Task.updateOrCreate(
      {
        publicId: data.id,
      },
      {
        completedAt: DateTime.fromMillis(rawEvent.ts),
      }
    )
  }

  async handleBalanceReducedEvent(data: BalanceReducedPayloadV1, rawEvent: ValidEvent) {
    const user = await User.firstOrCreate({
      publicId: data.userId,
    })

    const dailyUserStats = await DailyUserStats.firstOrCreate({
      date: DateTime.fromMillis(rawEvent.ts).toISODate()!,
      userId: user.id,
    })
    // prettier-ignore
    await DailyUserStats.query()
      .where('id', dailyUserStats.id)
      .increment('money_lost', data.amount)
  }

  async handleBalanceIncreasedEvent(data: BalanceIncreasedPayloadV1, rawEvent: ValidEvent) {
    await Task.updateOrCreate(
      {
        publicId: data.taskId,
      },
      {
        moneyCost: data.amount,
      }
    )

    const user = await User.firstOrCreate({
      publicId: data.userId,
    })

    const dailyUserStats = await DailyUserStats.firstOrCreate({
      date: DateTime.fromMillis(rawEvent.ts).toISODate()!,
      userId: user.id,
    })
    // prettier-ignore
    await DailyUserStats.query()
      .where('id', dailyUserStats.id)
      .increment('money_earned', data.amount)
  }
}
