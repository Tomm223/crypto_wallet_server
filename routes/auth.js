const Router = require('express')
const router = new Router()
const controller = require('../controlls/authController')
const { check } = require("express-validator")
const authMiddleware = require('../middlewaree/authMiddleware')
const roleMiddleware = require('../middlewaree/roleMiddleware')

router.post('/registration', [
    check('email', "Имя пользователя не может быть пустым").notEmpty(),
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('lastname', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 4 и меньше 20 символов").isLength({ min: 4, max: 20 })
], controller.registration)
router.post('/login', controller.login)
router.get('/refresh', controller.refresh)
router.get('/img/:file', controller.getAvatar)
router.post('/img', authMiddleware, controller.postAvatar)
router.get('/logout', controller.logout)
router.post('/change', authMiddleware, controller.Change)

module.exports = router
