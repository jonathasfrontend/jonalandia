const cron = require('node-cron');
const { info, erro } = require('../Logger');
const { client } = require("../Client");

function UpdateRoles() {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const cargoRecemChegado = process.env.CARGO_RECEM_CHEGADO;
    const cargoMembroPlus = process.env.CARGO_MEMBRO_PLUS;

    if (!guild) {
        return info.info('Guild não encontrada.');
    }

    guild.members.fetch().then(members => {
        members.forEach(member => {
            const recemChegadoRole = member.roles.cache.has(cargoRecemChegado);
            if (recemChegadoRole) {
                const joinedAt = member.joinedAt;
                const now = new Date();
                const oneMonthAgo = new Date(now);
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                if (joinedAt <= oneMonthAgo) {
                    try {
                        member.roles.add(cargoMembroPlus);

                        member.send(`Parabéns, você ${member.user.tag} recebeu o cargo de Membro Plus após um mês no servidor Jonalandia!`)
                            .then(() => info.info(`Mensagem enviada ao membro ${member.user.tag}.`))
                            .catch(error => info.info(`Erro ao enviar mensagem para o membro ${member.user.tag}:`, error));
                            
                        info.info(`Cargo "Membro Plus" adicionado ao membro ${member.user.tag} após um mês.`);

                        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
                        discordChannel.send(`Cargo "Membro Plus" adicionado ao membro ${member.user.tag} após um mês.`)
                    } catch (error) {
                        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT)
                        erro.error(`Erro ao atualizar cargos para o membro ${member.user.tag}:`, error);
                        discordChannel.send(`Erro ao atualizar cargos para o membro ${member.user.tag}`)
                    }
                }
            }
        });
    }).catch(error => {
        erro.error(`Erro ao buscar membros:`, error);
    });
}

// Agendar a função para rodar a cada mes
function checkUpdateRoles(){
    cron.schedule('0 0 1 * *', () => {
        UpdateRoles();
    });
}

module.exports = { checkUpdateRoles };
