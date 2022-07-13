export default class LoginRequest {
    email;
    password;

    constructor(model) {
        this.email = model.email;
        this.password = model.password;
    }
}