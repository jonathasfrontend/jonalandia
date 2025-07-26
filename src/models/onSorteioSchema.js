const mongoose = require('mongoose');

const sorteioSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true,
        unique: true
    },
    nomeUsuario: {
        type: String,
        required: true
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    },
});

const Sorteio = mongoose.model('onSorteioSchema', sorteioSchema);

module.exports = Sorteio;
