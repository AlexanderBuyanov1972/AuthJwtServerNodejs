module.exports = class RegistrationRequest {
    email;
    username;
    roles;
    password;

    constructor(model) {
        this.email = model.email;
        this.username = model.username;
        this.roles = model.roles;
        this.password = model.password;
    }
}