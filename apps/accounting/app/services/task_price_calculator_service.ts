import { randomInt } from 'node:crypto'
import Task from '#models/task'

export class TaskPriceCalculatorService {
  calcForAssign(_task: Task): number {
    return randomInt(10, 20)
  }

  calcForCompletion(_task: Task): number {
    return randomInt(20, 40)
  }
}
