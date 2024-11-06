const mongoose = require('mongoose');
const { info, erro } = require('../logger');

const user = 'root';
const password = 'dFrPbwloK4qEAnKy';
const cluster = 'cluster0';
const dbname = 'bot';

function bdServerConect() {
    mongoose.connect(`mongodb+srv://${user}:${password}@${cluster}.xvdlp.mongodb.net/${dbname}?retryWrites=true&w=majority`)
        .then(() => info.info('Conectado ao MongoDB'))
        .catch(err => erro.error('Erro ao conectar ao MongoDB', err));
}

module.exports = { bdServerConect };
