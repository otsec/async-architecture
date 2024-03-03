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

router.on('/').render('pages/home')

router.get('/auth/redirect', [AuthController, 'redirect'])
router.get('/auth/callback', [AuthController, 'callback'])
