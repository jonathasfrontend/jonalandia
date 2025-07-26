const { Logger } = require('../logger');
const { client } = require('../Client');
const Infractions = require('../models/onInfracoesUsersSchema');

async function saveUserInfractions(
    userId,
    username,
    avatarUrl,
    accountCreatedDate,
    joinedServerDate,
    type,
    reason,
    moderator
) {
    try {
        let userData = await Infractions.findOne({ username });

        if (!userData) {
            userData = new Infractions({
                userId,
                username,
                avatarUrl,
                accountCreatedDate,
                joinedServerDate,
                infractions: { [type]: 1 },
                logs: [{
                    type,
                    reason,
                    date: new Date(),
                    moderator,
                }]
            });
        } else {
            userData.infractions[type] = (userData.infractions[type] || 0) + 1;
            userData.logs.push({
                type,
                reason,
                date: new Date(),
                moderator,
            });
        }

        await userData.save();

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        await logChannel.send(`Infração registrada no banco com sucesso no usuário ${username} ${reason}.`);

        Logger.info(`Infração registrada no banco com sucesso no usuário ${username} ${reason}.`);

    } catch (error) {
        Logger.error('Erro ao aplicar ao cadastrar a infração no banco de dados:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao aplicar ao cadastrar a infração no banco de dados: ${error}`);
    }
}

module.exports = { saveUserInfractions };