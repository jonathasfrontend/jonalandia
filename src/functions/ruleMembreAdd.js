const { info, erro } = require('../Logger');

function ruleMembreAdd(member) {
    const cargoRecemChegado = process.env.CARGO_RECEM_CHEGADO;

    try {
        member.roles.add(cargoRecemChegado);
        info.info(`Cargo "Recém Chegado" adicionado ao membro ${member.user.tag}`);

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel2.send(`Cargo "Recém Chegado" adicionado ao membro ${member.user.tag}}.`)
        
    } catch (error) {
        erro.error(`Erro ao adicionar cargo ao membro ${member.user.tag}:`, error);
    }
}

module.exports = { ruleMembreAdd };