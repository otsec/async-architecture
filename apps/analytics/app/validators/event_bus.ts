import vine from '@vinejs/vine'

// eslint-disable-next-line @typescript-eslint/naming-convention
const Jan_1_2024 = 1701298800000

export const anyEventValidator = vine.compile(
  vine.object({
    name: vine.string(),
    version: vine.number(),
    payload: vine.object({}).allowUnknownProperties(),
    ts: vine.number().min(Jan_1_2024),
  })
)
