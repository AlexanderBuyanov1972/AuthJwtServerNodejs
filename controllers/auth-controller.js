const authService = require('../services/auth-service')

class AuthController {

    async registration(req, res, next) {
        return authService.registration(req, res, next)
    }

    async login(req, res, next) {
        return authService.login(req, res, next)
    }

    async logout(req, res, next) {
        return authService.logout(req, res, next)
    }

    async activate(req, res, next) {
        return authService.activate(req, res, next)
    }

    async refresh(req, res, next) {
        return authService.refresh(req, res, next)
    }

    async check(req, res, next) {
        return authService.check(req, res, next)
    }

    // --- for checking middleware ---
    async getAll(req, res, next){
        return authService.getAll(req, res, next);
    }

}

module.exports = new AuthController();