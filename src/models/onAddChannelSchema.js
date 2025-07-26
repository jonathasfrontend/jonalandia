const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    channelId: { type: String, unique: true, required: true },
    channelName: { type: String, required: true },
    channelType: { type: String, required: true },
    guildId: { type: String, required: true },
    guildName: { type: String, required: true },
}, { timestamps: true });

const ChannelModel = mongoose.model('onAddChannelsSchema', channelSchema);

module.exports = ChannelModel;
