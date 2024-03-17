import env from '#start/env'
import { Partitioners } from 'kafkajs'

const busConfig = {
  producerName: 'accounting',

  kafka: {
    client: {
      clientId: 'accounting-service',
      brokers: [env.get('KAFKA_BROKER_1')],
    },

    producer: {
      createPartitioner: Partitioners.DefaultPartitioner,
    },

    consumer: {
      groupId: 'accounting-service',
    },
  },
}

export default busConfig
