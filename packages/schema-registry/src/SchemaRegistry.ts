import fs from 'node:fs'
import YAML from 'yaml'
import Ajv from 'ajv'

export default class SchemaRegistry {
  static async validate(data: unknown, schemaName: string): Promise<boolean> {
    const schemaUrl = new URL(`../schema/${schemaName}.yml`, import.meta.url)
    const schemaYml = await fs.promises.readFile(schemaUrl, 'utf-8')
    const schemaJson = YAML.parse(schemaYml)

    const ajv = new Ajv.default({})
    const validate = ajv.compile(schemaJson)
    return validate(data)
  }
}
