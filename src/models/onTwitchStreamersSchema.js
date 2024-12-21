const mongoose = require("mongoose");

const streamersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model("onTwitchStreamersSchema", streamersSchema);
