const mongoose = require('mongoose');
const { info, erro } = require('../logger');

function bdServerConect() {
    mongoose.connect('mongodb+srv://root:dFrPbwloK4qEAnKy@cluster0.xvdlp.mongodb.net/bot?retryWrites=true&w=majority')
        .then(() => info.info('Conectado ao MongoDB'))
        .catch(err => erro.error('Erro ao conectar ao MongoDB', err));
}

module.exports = { bdServerConect };
