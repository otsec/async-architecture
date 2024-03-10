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
const TasksController = () => import('#controllers/tasks_controller')

router.get('/', [HomeController, 'index'])

router.get('/tasks', [TasksController, 'index']).as('tasks.index')
router.get('/tasks/create', [TasksController, 'create']).as('tasks.create')
router.post('/tasks', [TasksController, 'store']).as('tasks.store')
router.post('/tasks/shuffle', [TasksController, 'shuffle']).as('tasks.shuffle')
router.get('/tasks/:id', [TasksController, 'edit']).as('tasks.edit')
router.post('/tasks/:id', [TasksController, 'update']).as('tasks.update')
router.post('/tasks/:id/complete', [TasksController, 'complete']).as('tasks.complete')

router.get('/auth/redirect', [AuthController, 'redirect']).as('login')
router.get('/auth/callback', [AuthController, 'callback'])
