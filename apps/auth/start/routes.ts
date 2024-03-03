/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const OauthController = () => import('#controllers/oauth_controller')

router.get('/', [HomeController, 'index']).as('home')

router
  .group(() => {
    router.get('/login', [AuthController, 'login']).as('auth.login')
    router.post('/login', [AuthController, 'authenticate']).as('auth.authenticate')
  })
  .use(middleware.guest())
router.post('/logout', [AuthController, 'logout']).as('auth.logout')

router.get('/oauth/authorize', [OauthController, 'authorize'])
router.any('/oauth/token', [OauthController, 'token'])
router.any('/oauth/userinfo', [OauthController, 'userInfo'])

router
  .group(() => {
    router.get('/users', [UsersController, 'index']).as('users.index')
    router.get('/users/create', [UsersController, 'create']).as('users.create')
    router.post('/users/create', [UsersController, 'store']).as('users.store')
    router.get('/users/:id/edit', [UsersController, 'edit']).as('users.edit')
    router.post('/users/:id', [UsersController, 'update']).as('users.update')
  })
  .use(middleware.auth())
