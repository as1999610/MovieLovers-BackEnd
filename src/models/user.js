import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
    email: {type: String, 
        required: true, 
        lowercase: true, 
        index: true,
        unique: true
    },
    passwordHash: {
        type: String, 
        required: true},
    confirmed: {type: Boolean, default: false},
    cofirmingToken: {type: String, default: ""}
    }, 
    {
        timestamps: true
    }
);

schema.method.passwordValid = function passwordValid(password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

schema.methods.setPassword = function setPassword(password) {
    this.passwordHash = bcrypt.hashSync(password, 10);
}

schema.methods.setConfirmingToken = function setConfirmingToken(p) {
    this.cofirmingToken = this.generateToken();
}

schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
    return `${process.env.HOST}/confirmation/${this.confirmingToken}`
}

schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
    return `${process.env.HOST}/confirmation/${this.generateResetPasswordToken}`;
}

schema.methods.generateToken = function generateToken() {
    return jwt.sign({
        email: this.email,
        confirmed: this.confirmed
    }, process.env.JWT_SECRET)
}

schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
    return jwt.sign({
        _id: this._id,
    }, process.env.JWT_SECRET, {expresIn: '1h'})
}

schema.methods.authJSON = function authJSON() {
    return {
        email: this.email,
        confirmed: this.confirmed,
        token: this.generateToken()
    }
};

schema.plugin(uniqueValidator, {message: 'This email is already in use'})

export default mongoose.model('User', schema);