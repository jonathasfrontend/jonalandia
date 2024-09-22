const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        day: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
    }
);

module.exports = mongoose.model('onNotificationBirthdaySchema', PostSchema);