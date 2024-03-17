import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import SchemaRegistry, {
  TaskCompletedPayloadV1,
  TaskCreatedPayloadV1,
  TaskReassignedPayloadV1,
  TaskUpdatedPayloadV1,
} from '@popug/schema-registry'
import busConfig from '#config/bus'
import TaskCreated from '#events/task_created'
import TaskUpdated from '#events/task_updated'
import TaskReassigned from '#events/task_reassigned'
import TaskCompleted from '#events/task_completed'

export default class KafkaEventStream {
  async handle(event: unknown) {
    if (event instanceof TaskCreated) {
      const task = event.task

      if (!task.assignedTo) {
        await task.load('assignedTo')
      }

      let payload: TaskCreatedPayloadV1 = {
        id: task.publicId,
        assignedTo: task.assignedTo.publicId,
        title: task.title,
        description: task.description,
      }
      await this.sendToKafka('TaskCreated', 1, payload, '' + task.id)
    }

    if (event instanceof TaskUpdated) {
      const task = event.task

      let payload: TaskUpdatedPayloadV1 = {
        id: task.publicId,
        title: task.title,
        description: task.description,
      }
      await this.sendToKafka('TaskUpdated', 1, payload, '' + task.id)
    }

    if (event instanceof TaskReassigned) {
      const task = event.task

      if (!task.assignedTo) {
        await task.load('assignedTo')
      }

      let payload: TaskReassignedPayloadV1 = {
        id: task.publicId,
        assignedTo: task.assignedTo.publicId,
      }
      await this.sendToKafka('TaskReassigned', 1, payload, '' + task.id)
    }

    if (event instanceof TaskCompleted) {
      const task = event.task

      if (!task.assignedTo) {
        await task.load('assignedTo')
      }

      let payload: TaskCompletedPayloadV1 = {
        id: task.publicId,
        completedBy: task.assignedTo.publicId,
      }
      await this.sendToKafka('TaskCompleted', 1, payload, '' + task.id)
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
