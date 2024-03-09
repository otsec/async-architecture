import fs from 'node:fs'
import YAML from 'yaml'
import Ajv from 'ajv'

type ValidationResult = {
  valid: boolean
  errors: unknown[] | null | undefined
}

export default class SchemaRegistry {
  static async validate(eventName: string, eventVersion: number, data: unknown): Promise<ValidationResult> {
    const schemaUrl = new URL(`../schema/${eventName}.${eventVersion}.yml`, import.meta.url)
    const schemaYml = await fs.promises.readFile(schemaUrl, 'utf-8')
    const schemaJson = YAML.parse(schemaYml)

    const ajv = new Ajv.default({})
    const validate = ajv.compile(schemaJson)
    const isValid = validate(data)

    if (isValid) {
      return { valid: true, errors: null }
    } else {
      return { valid: false, errors: validate.errors }
    }
  }
}
