const { logger, botEvent } = require('../logger');
const { client } = require('../Client');

function ruleMembreAdd(member) {
    const context = {
        module: 'ROLES',
        user: member.user.tag,
        guild: member.guild?.name
    };

    const cargoRecemChegado = process.env.CARGO_RECEM_CHEGADO;

    logger.debug(`Adicionando cargo de recém-chegado para ${member.user.tag}`, context);

    try {
        member.roles.add(cargoRecemChegado);
        
        logger.info(`Cargo "Recém Chegado" adicionado para ${member.user.tag}`, context);
        botEvent('NEWCOMER_ROLE_ADDED', `Cargo adicionado para ${member.user.tag}`);

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (discordChannel2) {
            try {
                discordChannel2.send(`Cargo "Recém Chegado" adicionado ao membro ${member.user.tag}.`);
                logger.debug('Log de cargo enviado para canal', context);
            } catch (logError) {
                logger.warn('Erro ao enviar log para canal', context, logError);
            }
        } else {
            logger.warn('Canal de logs não encontrado', context);
        }
        
    } catch (error) {
        logger.error(`Erro ao adicionar cargo para ${member.user.tag}`, context, error);
        botEvent('NEWCOMER_ROLE_FAILED', `Erro ao adicionar cargo para ${member.user.tag}: ${error.message}`);
    }
}

module.exports = { ruleMembreAdd };