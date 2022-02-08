const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const userModel = require('../models/user-model')

class UserService {
    async registration(email, password) {
        const condidate = await UserModel.findOne({ email })
        if (condidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым аддрессом ${email} уже существует.`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const user = await UserModel.create({ email, password: hashPassword, activationLink })
        await mailService.sendActivationMail(email, `${process.env.API_URL_SERVER}/api/activate/${activationLink}`)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }

    async activate(activationLink) {
        const user = await userModel.findOne({ activationLink })
        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации.')
        }
        user.isActivated = true
        user.save()
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email })
        if (!user)
            throw ApiError.BadRequest("Пользователь с таким email не найден.")
        const isPasswordsEquals = await bcrypt.compare(password, user.password)
        if (!isPasswordsEquals)
            throw ApiError.BadRequest("Введён некорректный пароль.")

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken)
            throw ApiError.UnauthorizedError();

        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDB)
            throw ApiError.UnauthorizedError()

        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }

    async getAllUsers() {
        const users = await userModel.find();
        return users
    }

    async returnTokens(user) {
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }
}

module.exports = new UserService();