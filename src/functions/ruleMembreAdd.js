const logger = require('../logger');

function ruleMembreAdd(member) {
    const cargoRecemChegado = process.env.CARGO_RECEM_CHEGADO;

    try {
        member.roles.add(cargoRecemChegado);
        logger.info(`Cargo "Recém Chegado" adicionado ao membro ${member.user.tag}`);
    } catch (error) {
        logger.info(`Erro ao adicionar cargo ao membro ${member.user.tag}:`, error);
    }
}

module.exports = { ruleMembreAdd };