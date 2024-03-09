import { describe, test } from 'node:test'
import SchemaRegistry from '../src/SchemaRegistry.js'

describe('user.created', () => {
  test('v1', async () => {
    const event = {
      id: '252c0409-bbc1-44ff-a863-37256316f69e',
      name: 'UserCreated',
      version: 1,
      ts: 1710007436512,
      producer: 'any-service',
      payload: {
        id: '5b59f377-826d-48ac-a8e7-333cee1c7be1',
        email: 'test@example.com',
        fullName: 'John',
        role: 'user',
      },
    }

    const result = await SchemaRegistry.validate('UserCreated', 1, event)
    if (!result.valid) {
      console.error(result.errors)
      throw new Error('Error is invalid')
    }
  })
})
