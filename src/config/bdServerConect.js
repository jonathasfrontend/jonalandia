const mongoose = require('mongoose');
const { info, erro } = require('../logger');

function bdServerConect() {
    mongoose.connect('link connection mongobg')
        .then(() => info.info('Conectado ao MongoDB'))
        .catch(err => erro.error('Erro ao conectar ao MongoDB', err));
}

module.exports = { bdServerConect };
