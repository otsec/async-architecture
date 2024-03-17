import emitter from '@adonisjs/core/services/emitter'
import TaskCreated from '#events/task_created'
import TaskUpdated from '#events/task_updated'
import TaskReassigned from '#events/task_reassigned'
import TaskCompleted from '#events/task_completed'

const KafkaEventStream = () => import('#listeners/kafka_event_stream')
emitter.listen(TaskCreated, [KafkaEventStream])
emitter.listen(TaskUpdated, [KafkaEventStream])
emitter.listen(TaskReassigned, [KafkaEventStream])
emitter.listen(TaskCompleted, [KafkaEventStream])
