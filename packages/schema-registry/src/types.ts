export type EventEnvelope<N extends string, V extends number, P extends object> = {
  name: N
  version: V
  ts: number
  payload: P
}

export type ValidEvent = EventEnvelope<'UserCreated', 1, UserCreatedPayloadV1>
  | EventEnvelope<'UserUpdated', 1, UserUpdatedPayloadV1>
  | EventEnvelope<'TaskCreated', 1, TaskCreatedPayloadV1>
  | EventEnvelope<'TaskUpdated', 1, TaskUpdatedPayloadV1>
  | EventEnvelope<'TaskReassigned', 1, TaskReassignedPayloadV1>
  | EventEnvelope<'TaskCompleted', 1, TaskCompletedPayloadV1>
  | EventEnvelope<'BalanceReduced', 1, BalanceReducedPayloadV1>
  | EventEnvelope<'BalanceIncreased', 1, BalanceIncreasedPayloadV1>

export type UserCreatedPayloadV1 = {
  id: string
  email: string
  fullName: string
  role: string
}

export type UserUpdatedPayloadV1 = {
  id: string
  email: string
  fullName: string
  role: string
}

export type TaskCreatedPayloadV1 = {
  id: string
  assignedTo: string
  title: string
  description: string
}

export type TaskUpdatedPayloadV1 = {
  id: string
  title: string
  description: string
}

export type TaskReassignedPayloadV1 = {
  id: string
  assignedTo: string
}

export type TaskCompletedPayloadV1 = {
  id: string
  completedBy: string
}

export type BalanceReducedPayloadV1 = {
  userId: string
  taskId: string
  amount: number
}

export type BalanceIncreasedPayloadV1 = {
  userId: string
  taskId: string
  amount: number
}
