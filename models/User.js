const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectId;

// Note to future self: functions declared below that need access
// to the document themselves with "this" won't work as arrow functions.

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 7,
        maxLength: 20,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        maxLength: 40,
        trim: true,
        unique: true,
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value))
                throw new Error({ error: 'Invalid Email address' });
        },
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
    },
    replays: [ObjectId],
    tokens: [String],
});

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8);
    next();
});

// Generate an auth token for the user, unique to the login from their current device
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    user.tokens.push(token);
    await user.save();
    return token;
};

// Search for a user by email and password
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Could not find the given email');

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) throw new Error('Incorrect password for given email');

    return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
