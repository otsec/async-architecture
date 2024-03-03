import type { ApplicationService } from '@adonisjs/core/types'

export default class PopugProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    // const Ally = await this.app.container.make('ally')
    // const { PopugDriver } = await import('../src/popug_driver.js')
    //
    // Ally.extend('popup_driver', (_, __, config, ctx) => {
    //   return new PopugDriver(ctx, config)
    // })
  }
}
