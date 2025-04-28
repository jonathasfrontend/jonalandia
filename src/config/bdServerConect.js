const mongoose = require('mongoose');
const { info, erro } = require('../logger');

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const cluster = process.env.MONGO_CLUSTER;
const db = process.env.MONGO_DB;

function bdServerConect() {
    mongoose.connect(`mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`)
        .then(() => info.info('Conectado ao MongoDB'))
        .catch(err => erro.error('Erro ao conectar ao MongoDB', err));
}

module.exports = { bdServerConect };
