const ApiError = require('../exceptions/api-error')
const tokenService = require('../services/token-service')

module.exports = function (req, res, next) {
    console.log("---------- auth- middlware-------------")
    try {
        const authorizationHeader = req.headers.authorization
        if (!authorizationHeader)
            return next(ApiError.UnauthorizedError("Нет свойства Authorization в заголовке запроса"))
        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken)
            return next(ApiError.UnauthorizedError("Нет accesstoken в свойстве Authorization заголовка запроса"))
        const userData = tokenService.validateAccessToken(accessToken)
        if (!userData)
            return next(ApiError.UnauthorizedError("Accesstoken невалиден"))
       // req.user = userData
        next()
    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
} 