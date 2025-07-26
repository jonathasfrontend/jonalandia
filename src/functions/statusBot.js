const { PresenceUpdateStatus } = require('discord.js');
const { client } = require('../Client');
const { logger, botEvent } = require('../logger');

function Status() {
    const context = { module: 'BOT' };
    
    try {
        logger.info('Configurando status do bot', context);
        
        client.user.setPresence({
            activities: [
                {
                    name: ' | Jonalandia The Games',
                    status: PresenceUpdateStatus.Online,
                    url: 'https://github.com/jonathasfrontend',
                }
            ]
        });

        logger.info('Status do bot configurado com sucesso', {
            ...context,
            status: 'Online',
            activity: 'Jonalandia The Games'
        });
        
        botEvent('BOT_STATUS_SET', 'Status configurado: Online - Jonalandia The Games');

    } catch (error) {
        logger.error('Erro ao configurar status do bot', context, error);
        botEvent('BOT_STATUS_ERROR', `Erro ao configurar status: ${error.message}`);
    }
}
module.exports = { Status }