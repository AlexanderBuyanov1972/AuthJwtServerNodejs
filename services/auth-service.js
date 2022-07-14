const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const userModel = require('../models/user-model')
const { validationResult } = require('express-validator')

class AuthService {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { username, email, password, roles } = req.body;
            const condidate = await userModel.findOne({ email });
            if (condidate) {
                return res.json({ user: new UserDto(condidate) })
            }
            const hashPassword = await bcrypt.hash(password, 3)
            const activationLink = uuid.v4()
            await mailService.sendActivationMail(email, `${process.env.API_URL_SERVER}/api/activate/${activationLink}`)
            const user = await userModel.create({ username, email, password: hashPassword, roles, activationLink, isActivated: false })
            return res.json({ user: new UserDto(user) })
        } catch (error) {
            console.log("******************** CATCH  registration **************************")
            next(error)
        }

    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty())
                return next(ApiError.BadRequest('Ошибка при валидации запроса', errors.array()))
            const { email, password } = req.body
            const user = await userModel.findOne({ email })
            if (!user)
                return res.json({ 'message': `Пользователь с почтовым адрессом ${email} не найден.` })
            const isPasswordsEquals = await bcrypt.compare(password, user.password)
            if (!isPasswordsEquals)
                return res.json({ 'message': "Введён некорректный пароль." })
            this.sendDataToClient(user, res)
        } catch (error) {
            console.log("******************** CATCH  login **************************")
            next(error)
        }

    }

    async logout(req, res, next) {
        try {
            const accessToken = req.headers.authorization
            const userDto = tokenService.validateAccessToken(accessToken.split(" ")[1])
            await tokenService.removeToken(userDto.email)
            res.clearCookie('refreshToken')
            return res.json({ 'message': "Нou are logged out." })
        } catch (error) {
            console.log("******************** CATCH  logout **************************")
            next(error)
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            const user = await userModel.findOne({ activationLink })
            if (!user)
                throw ApiError.BadRequest('Некорректная ссылка активации.')
            user.isActivated = true
            user.save()
            return res.redirect(process.env.API_URL_CLIENT)
        } catch (error) {
            console.log("******************** CATCH  activate **************************")
            next(error)
        }

    }

    async refresh(req, res, next) {
        try {
            const refreshToken = req.params.refreshToken
            if (!refreshToken) {
                let { refreshToken } = req.cookies;
                if (!refreshToken)
                    throw ApiError.UnauthorizedError();
            }

            const userData = tokenService.validateRefreshToken(refreshToken)
            const tokenDB = await tokenService.findToken(userData.email)
            if (!userData || !tokenDB)
                throw ApiError.UnauthorizedError()

            const user = await userModel.findOne({ email: userData.email })
            if (user)
                this.sendDataToClient(user, res)
        } catch (error) {
            console.log("******************** CATCH  refresh **************************")
            next(error)
        }
    }


    async check(req, res, next) {
        try {
            const { email } = req.params;
            const user = await UserModel.findOne({ email });
            if (user)
                return res.json(this.setResponse('', 'OK', new UserDto(user)))
            return res.json({ 'message': `Пользователь с таким ${email} не найден.` })
        } catch (error) {
            console.log("******************** CATCH  check **************************")
            next(error)
        }
    }

    async sendDataToClient(user, res) {
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.removeToken(userDto.email)
        await tokenService.saveToken(userDto.email, tokens.refreshToken)
        this.setCookie(res, tokens.refreshToken)
        return res.json(this.setResponse(tokens.accessToken, tokens.refreshToken, userDto))
    }

    setCookie(res, refreshToken) {
        return res.cookie('refreshToken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
    }

    setResponse(accessToken, refreshToken, userDto) {
        return {
            accessToken,
            refreshToken,
            user: userDto
        }
    }

    // --- for checking middleware ---

    async getAll(req, res, next) {
        const data = await userModel.find()
        res.json({ ...data })
    }

}

module.exports = new AuthService();