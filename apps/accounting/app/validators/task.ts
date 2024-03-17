import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    description: vine.string().trim(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    description: vine.string().trim(),
  })
)
