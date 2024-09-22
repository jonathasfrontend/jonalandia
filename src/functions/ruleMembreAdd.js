
const { info, erro } = require('../logger');

function ruleMembreAdd(member) {
    const cargoRecemChegado = process.env.CARGO_RECEM_CHEGADO;

    try {
        member.roles.add(cargoRecemChegado);
        info.info(`Cargo "Recém Chegado" adicionado ao membro ${member.user.tag}`);
    } catch (error) {
        erro.error(`Erro ao adicionar cargo ao membro ${member.user.tag}:`, error);
    }
}

module.exports = { ruleMembreAdd };