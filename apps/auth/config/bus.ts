import env from '#start/env'
import { Partitioners } from 'kafkajs'

const busConfig = {

  kafka: {
    client: {
      clientId: 'auth-service',
      brokers: [
        env.get('KAFKA_BROKER_1'),
      ],
    },

    producer: {
      createPartitioner: Partitioners.DefaultPartitioner,
    },
  }
}

export default busConfig
