const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { logger, botEvent } = require('../logger');

function onMemberRemove(member) {
    const context = {
        module: 'MEMBER_EVENTS',
        user: member.user.tag,
        guild: member.guild?.name
    };

    logger.info(`Membro saiu do servidor: ${member.user.tag}`, context);
    botEvent('MEMBER_LEFT', `${member.user.tag} saiu do servidor`);

    try {
        const discordChannel = member.guild.channels.cache.get(process.env.CHANNEL_ID_ATE_LOGO);

        if (discordChannel) {
            const embed = new EmbedBuilder()
                .setColor(0xffffff)
                .setAuthor({
                    name: member.user.username,
                    iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTitle('😭 ahhhhh!')
                .setDescription(`⚰ **${member.user}** saiu do servidor...`)
                .setImage('https://i.pinimg.com/originals/81/2d/e9/812de920c0c7076356699d644418e326.gif')
                .setFooter({ text: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

            try {
                discordChannel.send({ embeds: [embed] });
                logger.debug('Embed de despedida enviado no canal público', context);
            } catch (embedError) {
                logger.error('Erro ao enviar embed de despedida', context, embedError);
            }
        } else {
            logger.warn('Canal de despedida não encontrado', context);
        }

        // Log no canal de logs
        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (discordChannel2) {
            try {
                discordChannel2.send(`${member.user} Acabou de sair no servidor ${member.guild}.`);
                logger.debug('Log de saída enviado para canal de logs', context);
            } catch (logError) {
                logger.warn('Erro ao enviar log para canal', context, logError);
            }
        } else {
            logger.warn('Canal de logs não encontrado', context);
        }

        // Tentativa de enviar DM de despedida
        const embed = new EmbedBuilder()
            .setColor(0xffffff)
            .setAuthor({
                name: member.user.username,
                iconURL: member.user.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTitle('😭 ahhhhh!')
            .setDescription(`⚰ **${member.user}** saiu do servidor...`)
            .setImage('https://i.pinimg.com/originals/81/2d/e9/812de920c0c7076356699d644418e326.gif')
            .setFooter({ text: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

        member.user.send({ embeds: [embed] })
            .then(() => {
                logger.debug(`DM de despedida enviada para ${member.user.tag}`, context);
                botEvent('FAREWELL_DM_SENT', `DM enviada para ${member.user.tag}`);
            })
            .catch(error => {
                if (error.code === 50007) {
                    logger.info(`Não foi possível enviar DM para ${member.user.tag} - DMs desativadas ou bot bloqueado`, context);
                    botEvent('FAREWELL_DM_BLOCKED', `DMs bloqueadas para ${member.user.tag}`);
                } else {
                    logger.warn(`Erro ao enviar DM de despedida para ${member.user.tag}`, context, error);
                    botEvent('FAREWELL_DM_FAILED', `Falha ao enviar DM para ${member.user.tag}: ${error.message}`);
                }
            });

    } catch (error) {
        logger.error('Erro ao processar saída de membro', context, error);
        botEvent('MEMBER_REMOVE_ERROR', `Erro ao processar saída de ${member.user.tag}: ${error.message}`);
    }
}

module.exports = { onMemberRemove };
