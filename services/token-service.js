const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '15s'
        })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '1d'
        })

        return {
            accessToken,
            refreshToken
        }

    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (error) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (error) {
            return null
        }
    }

    async saveToken(email, refreshToken) {
        const tokenData = await tokenModel.create({
            email, refreshToken
        })
        return tokenData;
    }

    async removeToken(email) {
        const tokenData = await tokenModel.deleteOne({ email })
        return tokenData
    }

    async findToken(email) {
        const tokenData = await tokenModel.findOne({ email })
        return tokenData
    }

}

module.exports = new TokenService();