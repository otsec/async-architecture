import { Kafka, Consumer, KafkaMessage } from 'kafkajs'
import z from 'zod'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

const prisma = new PrismaClient()
console.log(await prisma.todo.findMany())

// process.env.DATABASE_URL = "file:./dev.db"

// import { env } from '../env.js'
// import { prisma } from '../db.js'

const env = {
  DATABASE_URL: "file:./dev.db",
  KAFKA_BROKER_1: 'localhost:9092',
}

const messageSchema = z.object({
  name: z.string(),
  payload: z.unknown(),
})

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

export async function main() {
  const kafka = new Kafka({
    clientId: 'tasks-app',
    brokers: [env.KAFKA_BROKER_1],
  })

  const consumer = kafka.consumer({
    groupId: 'tasks-app',
  });

  await consumer.connect()

  await consumer.subscribe({
    topic: 'default',
    fromBeginning: true,
  })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        await handleMessage(message)
      } catch (e) {
        await handleError(e as Error, message)
      }
    },
  })
}

async function handleMessage(message: KafkaMessage) {
  if (!message.value) {
    throw new Error('Empty message')
  }

  const data = JSON.parse(message.value.toString())
  const parsed = messageSchema.parse(data)
  if (parsed.name === 'UserCreated' || parsed.name === 'UserUpdated') {
    await handleUserCudEvent(parsed as UserEvent)
  }

  throw new Error(`Unknown event: ${parsed.name}`)
}

async function handleError(e: Error, message: KafkaMessage) {
  console.error(e, 'message', message.value?.toString())
}

async function handleUserCudEvent(event: UserEvent) {
  console.log(event)
}

// main()
//   .catch(console.error)
