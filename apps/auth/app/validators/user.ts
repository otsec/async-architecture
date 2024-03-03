import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    role: vine.enum(['admin', 'accountant', 'user', 'disabled']),
    firstName: vine.string().trim().optional(),
    lastName: vine.string().trim().optional(),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(6),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    role: vine.enum(['admin', 'accountant', 'user', 'disabled']),
    firstName: vine.string().trim().optional(),
    lastName: vine.string().trim().optional(),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(6).optional(),
  })
)
