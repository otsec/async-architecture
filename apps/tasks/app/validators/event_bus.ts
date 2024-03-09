import vine from '@vinejs/vine'

export const anyEventValidator = vine.compile(
  vine.object({
    name: vine.string(),
    version: vine.number(),
    payload: vine.object({}).allowUnknownProperties(),
  })
)
