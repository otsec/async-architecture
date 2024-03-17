import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Kafka, KafkaMessage } from 'kafkajs'
import SchemaRegistry, {
  UserCreatedPayloadV1,
  UserUpdatedPayloadV1,
  TaskCreatedPayloadV1,
  TaskUpdatedPayloadV1,
  TaskReassignedPayloadV1,
  TaskCompletedPayloadV1,
  ValidEvent,
} from '@popug/schema-registry'
import busConfig from '#config/bus'
import { anyEventValidator } from '#validators/event_bus'
import User from '#models/user'
import Task from '#models/task'
import Transaction from '#models/transaction'
import { TaskPriceCalculatorService } from '#services/task_price_calculator_service'
import BalanceReduced from '#events/balance_reduced'
import BalanceIncreased from '#events/balance_increased'

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
      'BalanceReduced',
      'BalanceIncreased',
    ]
    if (ignoredEvents.includes(event.name)) {
      return
    }

    console.log('handling', event.name)

    if (event.name === 'UserCreated') {
      await this.handleUserCudEvent(event.payload)
    } else if (event.name === 'UserUpdated' && event.version === 1) {
      await this.handleUserCudEvent(event.payload)
    } else if (event.name === 'TaskCreated' && event.version === 1) {
      await this.handleTaskCreatedEvent(event.payload)
    } else if (event.name === 'TaskUpdated' && event.version === 1) {
      await this.handleTaskUpdatedEvent(event.payload)
    } else if (event.name === 'TaskReassigned' && event.version === 1) {
      await this.handleTaskAssignedEvent(event.payload)
    } else if (event.name === 'TaskCompleted' && event.version === 1) {
      await this.handleTaskCompletedEvent(event.payload)
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

  async handleTaskCreatedEvent(data: TaskCreatedPayloadV1) {
    const task = await Task.updateOrCreate(
      {
        publicId: data.id,
      },
      {
        title: data.title,
      }
    )

    const user = await User.updateOrCreate(
      {
        publicId: data.assignedTo,
      },
      {}
    )

    const taskPrice = new TaskPriceCalculatorService().calcForAssign(task)
    const transaction = await Transaction.create({
      ownerId: user.id,
      description: `Assigned to task ID ${task.id}`,
      taskId: task.id,
      amount: -1 * taskPrice,
    })

    await BalanceReduced.dispatch(transaction)
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

  async handleTaskAssignedEvent(data: TaskReassignedPayloadV1) {
    const task = await Task.updateOrCreate(
      {
        publicId: data.id,
      },
      {}
    )

    const user = await User.updateOrCreate(
      {
        publicId: data.assignedTo,
      },
      {}
    )

    const taskPrice = new TaskPriceCalculatorService().calcForAssign(task)
    const transaction = await Transaction.create({
      ownerId: user.id,
      description: `Assigned to task ID ${task.id}`,
      taskId: task.id,
      amount: -1 * taskPrice,
    })

    await BalanceReduced.dispatch(transaction)
  }

  async handleTaskCompletedEvent(data: TaskCompletedPayloadV1) {
    const task = await Task.updateOrCreate(
      {
        publicId: data.id,
      },
      {}
    )

    const user = await User.updateOrCreate(
      {
        publicId: data.completedBy,
      },
      {}
    )

    const taskPrice = new TaskPriceCalculatorService().calcForCompletion(task)
    const transaction = await Transaction.create({
      ownerId: user.id,
      description: `Completed task ID ${task.id}`,
      taskId: task.id,
      amount: taskPrice,
    })

    await BalanceIncreased.dispatch(transaction)
  }
}
