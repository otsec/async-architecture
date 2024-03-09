import { describe, test } from 'node:test'
import assert from 'node:assert'
import SchemaRegistry from '../src/SchemaRegistry.js'

describe('user.created', () => {
  test('v1', async () => {
    const event = {
      event_id: '252c0409-bbc1-44ff-a863-37256316f69e',
      event_version: 1,
      event_name: 'UserCreated',
      event_time: 1710007436512,
      producer: 'any-service',
      data: {
        id: '5b59f377-826d-48ac-a8e7-333cee1c7be1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: null,
        role: 'user',
      },
    }

    const valid = await SchemaRegistry.validate(event, 'user.created.1')

    assert.equal(valid, true)
  })
})
