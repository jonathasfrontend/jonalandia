const mongoose = require('mongoose');
const logger = require('../logger');

function bdServerConect() {
    mongoose.connect('mongodb+srv://root:dFrPbwloK4qEAnKy@cluster0.xvdlp.mongodb.net/bot?retryWrites=true&w=majority',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
        .then(() => logger.info('Conectado ao MongoDB'))
        .catch(err => logger.info('Erro ao conectar ao MongoDB', err));
}
bdServerConect();
module.exports = { bdServerConect };