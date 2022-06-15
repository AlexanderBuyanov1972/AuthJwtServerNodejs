module.exports = class UserDto {
    email;
    username;
    role;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.username = model.username;
        this.role = model.role;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}