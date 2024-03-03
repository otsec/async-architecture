import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async redirect({ ally }: HttpContext) {
    await ally.use('popug').redirect()
  }

  async callback({ ally }: HttpContext) {
    const driver = ally.use('popug')

    // User has denied access by canceling the login flow
    if (driver.accessDenied()) {
      return 'You have cancelled the login process'
    }

    // OAuth state verification failed. This happens when the CSRF cookie gets expired.
    if (driver.stateMisMatch()) {
      return 'We are unable to verify the request. Please try again'
    }

    // Oauth server responded with some error
    if (driver.hasError()) {
      return driver.getError()
    }

    // Access user info
    const user = await driver.user()

    return user
  }
}
