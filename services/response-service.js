const UserDto = require("../dtos/user-dto");
const tokenService = require("./token-service");

class ResponseService {

    async createDataForResponse(user) {
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {data: {accessToken: tokens.accessToken, user:userDto }, refreshToken:tokens.refreshToken}
    }

    setCookie(res, refreshToken) {
        return res.cookie('refreshToken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
    }

    response(res, data, message, resultCode) {
        return res.json({
            "data": data,
            "message": message,
            "resultCode": resultCode
        })

    }

}
module.exports = new ResponseService();