const userService = require('../services/user-service')

class UserController {

    async registration(req, res, next) {
        return userService.registration(req, res, next)
    }

    async login(req, res, next) {
        return userService.login(req, res, next)
    }

    async logout(req, res, next) {
        return userService.logout(req, res, next)
    }

    async activate(req, res, next) {
        return userService.activate(req, res, next)
    }

    async refresh(req, res, next) {
        return userService.refresh(req, res, next)
    }

    async check(req, res, next) {
        return userService.getUser(req, res, next)
    }

}

module.exports = new UserController();