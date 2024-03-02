import emitter from '@adonisjs/core/services/emitter'
import UserCreated from '#events/user_created'
import UserUpdated from '#events/user_updated'

const KafkaEventStream = () => import('#listeners/kafka_event_stream')
emitter.listen(UserCreated, [KafkaEventStream])
emitter.listen(UserUpdated, [KafkaEventStream])
