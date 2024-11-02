const { info, erro } = require('../logger');
const { client } = require("../Client");

async function autoKickNewMembers() {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) {
        return info.info('Guild não encontrada.');
    }

    const members = await guild.members.fetch();

    members.forEach(async (member) => {
        const joinedAt = member.joinedAt;
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        if (joinedAt > sevenDaysAgo && !member.user.bot) {
            try {
                await member.send(`Você foi expulso do servidor ${guild.name} por sua conta criada em menos de 7 dias.`);
                info.info(`Mensagem enviada ao membro ${member.user.tag} antes da expulsão.`);

                await member.kick('Conta criada há menos de 7 dias');

                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                discordChannel.send(`Membro ${member.user.tag} foi expulso por conta nova.`);
                
                info.info(`Membro ${member.user.tag} foi expulso por conta nova.`);
                
            } catch (error) {
                erro.error(`Erro ao expulsar membro ${member.user.tag}:`, error);
                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                discordChannel.send(`Membro ${member.user.tag} foi expulso por conta nova.`);
            }
        }
    });
}

module.exports = { autoKickNewMembers };
