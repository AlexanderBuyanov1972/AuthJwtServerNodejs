const Router = require('express');
const authController = require('../controllers/auth-controller')
const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middliware')

const router = new Router();

router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 5, max: 15 }), authController.registration)
router.post('/login', body('email').isEmail(), body('password').isLength({ min: 5, max: 15 }), authController.login)
router.get('/activate/:link', authController.activate)
router.get('/refresh/:refreshToken', authController.refresh)


// --- for checking middleware ---
router.get('/check/:email', authMiddleware, authController.check)
router.get('/exit', authMiddleware, authController.logout)
router.get('/all', authMiddleware, authController.getAll)

module.exports = router