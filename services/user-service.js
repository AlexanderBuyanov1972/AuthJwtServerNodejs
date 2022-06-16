const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const userModel = require('../models/user-model')
const { validationResult } = require('express-validator')
const responseService = require("../services/response-service")



class UserService {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { username, email, password, role, isActivated } = req.body;
            const condidate = await userModel.findOne({ email });
            if (condidate) {
                responseService.response(res, null, `Пользователь с почтовым адрессом ${email} уже существует.`, 400)
            }
            const hashPassword = await bcrypt.hash(password, 3)
            const activationLink = uuid.v4()
            await mailService.sendActivationMail(email, `${process.env.API_URL_SERVER}/activate/${activationLink}`)
            const user = await userModel.create({ username, email, password: hashPassword, role, activationLink, isActivated })

            const data = await responseService.createDataForResponse(user);
            res = responseService.setCookie(res, data.tokens.refreshToken);
            responseService.response(res, data, "OK", 200)

        } catch (error) {
            next(error)
        }

    }


    async login(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { email, password } = req.body
            const user = await userModel.findOne({ email })
            if (!user)
                responseService.response(res, null, `Пользователь с почтовым адрессом ${email} не найден.`, 400)
            const isPasswordsEquals = await bcrypt.compare(password, user.password)
            if (!isPasswordsEquals)
                responseService.response(res, null, "Введён некорректный пароль.", 400)
            const data = await responseService.createDataForResponse(user);
            res = responseService.setCookie(res, data.tokens.refreshToken);
            responseService.response(res, data, "OK", 200)

        } catch (error) {
            next(error)
        }

    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            await tokenService.removeToken(refreshToken)
            res.clearCookie('refreshToken')
            responseService.response(res, null, "Нou are logged out.", 200)
        } catch (error) {
            next(error)
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            const user = await userModel.findOne({ activationLink })
            if (!user) {
                throw ApiError.BadRequest('Некорректная ссылка активации.')
            }
            user.isActivated = true
            user.save()
            return res.redirect(process.env.API_URL_CLIENT)
        } catch (error) {
            next(error)
        }

    }


    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken)
                throw ApiError.UnauthorizedError();
            const userData = tokenService.validateRefreshToken(refreshToken)
            const tokenDB = await tokenService.findToken(refreshToken)
            if (!userData || !tokenDB)
                throw ApiError.UnauthorizedError()
            const user = await userModel.findById(userData.id)
            if (user) {
                const data = await responseService.createDataForResponse(user);
                res = responseService.setCookie(res, data.tokens.refreshToken);
                responseService.response(res, data, "OK", 200)
            } else {
                responseService.response(res, null, "Не такого refresh токена в базе данных", 400)
            }
        } catch (error) {
            next(error)
        }
    }


    async getUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await UserModel.findOne({ id });
            if (user) {
                const userDto = new UserDto(user)
                responseService.response(res, { ...{ "accessToken": '', "refreshToken": '' }, user: userDto }, "OK", 200)
            }
            responseService.response(res, null, `Пользователь с таким id не найден.`, 400)
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new UserService();