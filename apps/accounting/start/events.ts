import emitter from '@adonisjs/core/services/emitter'
import BalanceReduced from '#events/balance_reduced'
import BalanceIncreased from '#events/balance_increased'

const KafkaEventStream = () => import('#listeners/kafka_event_stream')
emitter.listen(BalanceReduced, [KafkaEventStream])
emitter.listen(BalanceIncreased, [KafkaEventStream])
