import env from '#start/env'
import { Partitioners } from 'kafkajs'

const busConfig = {
  producerName: 'tasks',

  kafka: {
    client: {
      clientId: 'tasks-service',
      brokers: [env.get('KAFKA_BROKER_1')],
    },

    producer: {
      createPartitioner: Partitioners.DefaultPartitioner,
    },
  },
}

export default busConfig
