/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const HomeController = () => import('#controllers/home_controller')

router.get('/', [HomeController, 'index'])

router.get('/auth/redirect', [AuthController, 'redirect']).as('login')
router.get('/auth/callback', [AuthController, 'callback'])
