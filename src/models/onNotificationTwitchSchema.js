const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        streamer: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        gamer: {
            type: String,
            required: true
        },
    }
);

module.exports = mongoose.model('onNotificationTwitchSchema', PostSchema);