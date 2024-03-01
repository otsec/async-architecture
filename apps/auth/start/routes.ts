/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import UsersController from '#controllers/users_controller'
import AuthController from '#controllers/auth_controller'

router.get('/', [UsersController, 'index']).as('users.index')
router.get('/users/create', [UsersController, 'create']).as('users.create')
router.post('/users/create', [UsersController, 'store']).as('users.store')
router.get('/users/:id/edit', [UsersController, 'edit']).as('users.edit')
router.post('/users/:id', [UsersController, 'update']).as('users.update')

router.get('/login', [AuthController, 'login']).as('login')
