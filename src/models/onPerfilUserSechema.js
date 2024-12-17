const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    gems: {
        type: Number,
        default: 0
    },
    dailyRewardTimestamp: {
        type: Date,
        default: null 
    }
});

module.exports = mongoose.model('onPerfilUserSechema', userSchema);
