import { Kafka, Producer } from 'kafkajs'
import type { ApplicationService } from '@adonisjs/core/types'
import busConfig from '#config/bus'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'kafka': Kafka
    'kafka-producer': Producer
  }
}

export default class KafkaProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('kafka', () => {
      return new Kafka(busConfig.kafka.client)
    })

    this.app.container.singleton('kafka-producer', async (resolver) => {
      const kafka = await resolver.make('kafka')
      return kafka.producer(busConfig.kafka.producer)
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    const kafkaProducer = await this.app.container.make('kafka-producer')
    await kafkaProducer.connect()
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    const kafkaProducer = await this.app.container.make('kafka-producer')
    await kafkaProducer.disconnect()
  }
}
