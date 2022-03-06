const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 7,
        max: 255,
    },
    replays: [ObjectId],
    // uid: _id, property created by default on all schemas
});

module.exports = mongoose.model('User', userSchema);
