const userService = require('../services/user-service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error')

class UserController {

    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { username, email, password, role, isActivated } = req.body;
            const userData = await userService.registration(username, email, password, role, isActivated)
            if (userData.message) {
                return res.json(userData)
            } else {
                res.cookie('refreshToken', userData.refreshToken, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true
                })
                return res.json(userData)
            }

        } catch (error) {
            next(error)
        }

    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body
            const userData = await userService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            })
            return res.json(userData)

        } catch (error) {
            next(error)
        }

    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (error) {
            next(error)
        }

    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.API_URL_CLIENT)

        } catch (error) {
            next(error)
        }

    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            })
            return res.json(userData)

        } catch (error) {
            next(error)
        }
    }

    async check(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userService.getUser(id)
            if (user) {
                return res.json(user)
            }
            return res.json({"message":""})

        } catch (error) {
            next(error)
        }
    }

}

module.exports = new UserController();