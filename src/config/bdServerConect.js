const mongoose = require('mongoose');
const { info, erro } = require('../logger');

function bdServerConect() {
    mongoose.connect('link para seu mongo')
        .then(() => info.info('Conectado ao MongoDB'))
        .catch(err => erro.error('Erro ao conectar ao MongoDB', err));
}

bdServerConect();
module.exports = { bdServerConect };
