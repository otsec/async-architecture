import env from '#start/env'
import { Partitioners } from 'kafkajs'

const busConfig = {
  producerName: 'analytics',

  kafka: {
    client: {
      clientId: 'analytics-service',
      brokers: [env.get('KAFKA_BROKER_1')],
    },

    producer: {
      createPartitioner: Partitioners.DefaultPartitioner,
    },

    consumer: {
      groupId: 'analytics-service',
    },
  },
}

export default busConfig
