const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        release_date: {
            type: String,
            required: true
        },
        createdAt: { 
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model('onGameNotificationSchema', PostSchema);
