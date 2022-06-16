const Router = require('express');
const userController = require('../controllers/user-controller')
const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middliware')

const router = new Router();

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 5, max: 15 }),
    userController.registration)
router.post('/login',
    body('email').isEmail(),
    body('password').isLength({ min: 5, max: 15 }),
    userController.login)
router.get('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/check/:id', userController.check)

module.exports = router