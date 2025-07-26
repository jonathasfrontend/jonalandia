const mongoose = require('mongoose');

const premioSchema = new mongoose.Schema({
    premio: {
        type: String,
        required: true
    },
    dono: {
        type: String,
        required: true
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    },
});

const Premio = mongoose.model('onPremioSorteioSchema', premioSchema);

module.exports = Premio;
