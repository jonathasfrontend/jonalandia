const { EmbedBuilder } = require('discord.js');
const { logger, securityEvent, botEvent } = require('../../logger');
const { client } = require("../../Client");

async function autoKickNewMembers() {
    const context = { module: 'SECURITY' };
    
    logger.info('Iniciando verificação automática de contas novas', context);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) {
        logger.error('Guild não encontrada para verificação de contas novas', context);
        botEvent('AUTO_KICK_GUILD_NOT_FOUND', 'Guild não encontrada');
        return;
    }

    try {
        logger.debug(`Buscando membros do servidor ${guild.name}`, context);
        const members = await guild.members.fetch();
        
        logger.info(`Verificando ${members.size} membros para contas novas`, {
            ...context,
            guild: guild.name,
            memberCount: members.size
        });

        let kickedCount = 0;
        let checkedCount = 0;

        for (const [memberId, member] of members) {
            if (member.user.bot) continue; // Pular bots
            
            checkedCount++;
            const accountCreatedAt = member.user.createdAt;
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);

            const memberContext = {
                ...context,
                user: member.user.tag,
                guild: guild.name
            };

            if (accountCreatedAt > sevenDaysAgo) {
                logger.warn(`Conta nova detectada: ${member.user.tag} (criada em ${accountCreatedAt.toLocaleDateString()})`, memberContext);
                securityEvent('NEW_ACCOUNT_DETECTED', member.user, guild, `Conta criada em ${accountCreatedAt.toLocaleDateString()}`);

                try {
                    // Enviar DM antes de expulsar
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Expulsão do Servidor')
                        .setDescription(`Olá ${member.user.tag}, sua conta foi criada há menos de 7 dias e, por isso, você foi expulso do servidor **${guild.name}**.`)
                        .addFields(
                            { name: 'Motivo', value: 'Conta criada em menos de 7 dias', inline: true },
                            { name: 'Data de criação da conta', value: `${accountCreatedAt.toLocaleDateString()}`, inline: true }
                        )
                        .setFooter({ text: `Expulsão realizada por ${guild.owner?.user.tag}`, iconURL: guild.iconURL() })
                        .setTimestamp();

                    try {
                        await member.send({ embeds: [embed] });
                        logger.debug(`DM de notificação enviada para ${member.user.tag}`, memberContext);
                    } catch (dmError) {
                        logger.warn(`Erro ao enviar DM para ${member.user.tag}`, memberContext, dmError);
                    }

                    // Expulsar membro
                    await member.kick(`Conta criada há menos de 7 dias.`);
                    kickedCount++;

                    logger.info(`Membro ${member.user.tag} expulso por conta nova`, memberContext);
                    securityEvent('MEMBER_AUTO_KICKED', member.user, guild, 'Conta criada há menos de 7 dias');

                    // Log no canal
                    const logEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Membro Expulso')
                        .setDescription(`O membro ${member.user.tag} foi expulso por conta nova (criada há menos de 7 dias).`)
                        .addFields(
                            { name: 'Data de criação da conta', value: `${accountCreatedAt.toLocaleDateString()}`, inline: true },
                            { name: 'Expulsão realizada por', value: `${guild.owner?.user.tag}`, inline: true }
                        )
                        .setFooter({ text: `Expulsão registrada em ${now.toLocaleString()}`, iconURL: guild.iconURL() })
                        .setTimestamp();

                    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                    if (discordChannel) {
                        try {
                            await discordChannel.send({ embeds: [logEmbed] });
                            logger.debug('Log de expulsão enviado para canal', memberContext);
                        } catch (logError) {
                            logger.warn('Erro ao enviar log para canal', memberContext, logError);
                        }
                    } else {
                        logger.warn('Canal de logs não encontrado', memberContext);
                    }

                } catch (error) {
                    logger.error(`Erro ao expulsar membro ${member.user.tag}`, memberContext, error);
                    securityEvent('AUTO_KICK_FAILED', member.user, guild, error.message);
                    
                    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                    if (discordChannel) {
                        try {
                            await discordChannel.send(`Erro ao expulsar o membro ${member.user.tag}: ${error.message}`);
                        } catch (logError) {
                            logger.error('Erro ao enviar log de erro', memberContext, logError);
                        }
                    }
                }
            } else {
                logger.silly(`Conta de ${member.user.tag} aprovada (criada em ${accountCreatedAt.toLocaleDateString()})`, memberContext);
            }
        }

        logger.info(`Verificação de contas novas concluída`, {
            ...context,
            guild: guild.name,
            membersChecked: checkedCount,
            membersKicked: kickedCount
        });

        botEvent('AUTO_KICK_CHECK_COMPLETED', `Verificados: ${checkedCount}, Expulsos: ${kickedCount}`);

    } catch (error) {
        logger.error('Erro na verificação automática de contas novas', context, error);
        botEvent('AUTO_KICK_ERROR', `Erro na verificação: ${error.message}`);
    }
}

module.exports = { autoKickNewMembers };
