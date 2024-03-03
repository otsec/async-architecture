import vine from '@vinejs/vine'

export const anyEventValidator = vine.compile(
  vine.object({
    name: vine.string(),
    payload: vine.object({}).allowUnknownProperties(),
  })
)
