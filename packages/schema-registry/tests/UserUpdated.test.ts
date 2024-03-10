import { describe, test } from 'node:test'
import SchemaRegistry from '../src/SchemaRegistry.js'

describe('UserUpdated', () => {
  test('v1', async () => {
    const event = {
      id: '2850c909-a47d-498c-8e63-7b6913c8f46c',
      name: 'UserUpdated',
      version: 1,
      producer: 'auth',
      ts: 1710021772689,
      payload: {
        id: '4d48ebd3-0873-4176-a21c-2dc682aa51af',
        email: 'john.doe@example.com',
        fullName: 'New User',
        role: 'user'
      }
    }


    const result = await SchemaRegistry.validate('UserUpdated', 1, event)
    if (!result.valid) {
      console.error(result.errors)
      throw new Error('Error is invalid')
    }
  })
})
