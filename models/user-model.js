const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: [{ type: String, required: true }],
    isActivated: { type: Boolean, default: false, required: true },
    activationLink: { type: String },
})

module.exports = model('User', UserSchema);