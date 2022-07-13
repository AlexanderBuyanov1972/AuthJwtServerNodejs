module.exports = class TokensUserDto {
    accessToken;
    refreshToken;
    userDto;

    constructor(model) {
        this.accessToken = model.accessToken;
        this.refreshToken = model.refreshToken;
        this.userDto = model.userDto;
    }
}