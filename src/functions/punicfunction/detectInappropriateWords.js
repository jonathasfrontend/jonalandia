const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { logger, securityEvent, databaseEvent } = require('../../logger');
const inappropriateWordsData = require('../../config/InappropriateWords.json');
const { getBlockedChannels } = require('../../utils/checkingComandsExecution');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');

const inappropriateWords = inappropriateWordsData.inappropriateWords;

async function detectInappropriateWords(message) {
    if (message.author.bot) return;

    const context = {
        module: 'SECURITY',
        user: message.author.tag,
        guild: message.guild?.name
    };

    try {
        const channelsIdBLocke = await getBlockedChannels();

        if (!channelsIdBLocke.includes(message.channel.id)) {
            logger.silly(`Canal ${message.channel.name} não está sendo monitorado para palavras inapropriadas`, context);
            return;
        }

        // Verifica cada palavra usando regex para evitar subcadeias
        const foundWord = inappropriateWords.find(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i'); // 'i' para case-insensitive
            return regex.test(message.content);
        });

        if (foundWord) {
            logger.warn(`Palavra inadequada detectada: "${foundWord}"`, {
                ...context,
                channel: message.channel.name
            });

            securityEvent('INAPPROPRIATE_WORD_DETECTED', message.author, message.guild, `Palavra: "${foundWord}"`);

            try {
                await message.delete();
                logger.debug('Mensagem com palavra inadequada deletada', context);

                const reason = `O usuário ${message.author.username} usou palavras inadequadas: ${foundWord}`;
                const type = 'inappropriateLanguage';

                // Salvar infração
                try {
                    await saveUserInfractions(
                        message.author.id,
                        message.author.tag,
                        message.author.displayAvatarURL({ dynamic: true }),
                        message.author.createdAt,
                        message.member.joinedAt,
                        type,
                        reason,
                        client.user.tag
                    );
                    databaseEvent('INSERT', 'UserInfractions', true, `Infração por linguagem inadequada para ${message.author.tag}`);

                } catch (dbError) {
                    logger.error('Erro ao salvar dados da infração', context, dbError);
                    databaseEvent('INSERT/UPDATE', 'Database', false, dbError.message);
                }

                // Log no canal
                const discordChannelDelete = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                if (discordChannelDelete) {
                    try {
                        await discordChannelDelete.send(`Mensagem de ${message.author.tag} deletada devido a palavras inadequadas: "${foundWord}".`);
                        logger.debug('Log enviado para canal de informações', context);
                    } catch (logError) {
                        logger.warn('Erro ao enviar log para canal', context, logError);
                    }
                } else {
                    logger.warn('Canal de logs não encontrado', context);
                }

                // Embed para o canal
                const channelEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚫 Linguagem Inadequada Detectada')
                    .setDescription(`${message.author.tag}, você usou uma linguagem inadequada e foi silenciado por **5 minutos**.`)
                    .addFields(
                        { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                        { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                    )
                    .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                    .setTimestamp();

                try {
                    await message.channel.send({ embeds: [channelEmbed], ephemeral: true });
                    logger.debug('Embed de aviso enviado no canal', context);
                } catch (embedError) {
                    logger.warn('Erro ao enviar embed no canal', context, embedError);
                }

                // DM para o usuário
                try {
                    const userEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('⚠️ Aviso de Silenciamento')
                        .setDescription(`Você foi silenciado no servidor **${message.guild.name}** por **5 minutos** devido ao uso de palavras inadequadas.`)
                        .addFields(
                            { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                            { name: 'Servidor', value: message.guild.name, inline: true },
                        )
                        .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                        .setTimestamp();

                    await message.author.send({ embeds: [userEmbed], ephemeral: true });
                    logger.debug('DM de aviso enviada para o usuário', context);
                } catch (dmError) {
                    logger.warn('Erro ao enviar DM para o usuário', context, dmError);
                }

                // Aplicar timeout
                try {
                    const reason = `O usuário ${message.author.tag} recebeu um timeout de 3 minutos.`;
                    const type = 'timeouts';

                    saveUserInfractions(
                        message.author.id,
                        message.author.tag,
                        message.author.displayAvatarURL({ dynamic: true }),
                        message.author.createdAt,
                        message.member.joinedAt,
                        type,
                        reason,
                        client.user.tag
                    );

                    await message.member.timeout(300000, 'Uso de linguagem imprópria');

                    logger.info(`Timeout de 5 minutos aplicado para ${message.author.tag} por linguagem imprópria`, context);
                    securityEvent('TIMEOUT_APPLIED', message.author, message.guild, 'Linguagem inadequada - 5 minutos');

                } catch (timeoutError) {
                    
                    // verifica se o usuario que levou timeout é um dono ou administrador do servidor
                    if(message.author.id === message.guild.ownerId || message.member.permissions.has('🟨ADM')) {
                        logger.warn(`Tentativa de timeout falhou para ${message.author.tag} - usuário é dono ou administrador`, context);
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('⚠️ Timeout Falhou')
                            .setDescription(`Você não pode ser silenciado, pois é um administrador ou dono do servidor.`)
                            .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                            .setTimestamp();
                        await message.channel.send({ embeds: [embed], ephemeral: true });
                        return;
                    }

                    logger.error('Erro ao aplicar timeout', context, timeoutError);
                    securityEvent('TIMEOUT_FAILED', message.author, message.guild, timeoutError.message);
                }

                // Log detalhado no canal de logs
                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                if (discordChannel) {
                    try {
                        const logEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('🔴 Timeout Aplicado')
                            .setDescription(`${message.author.tag} foi silenciado no servidor **${message.guild.name}** por **5 minutos** devido ao uso de linguagem inadequada.`)
                            .addFields(
                                { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                                { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                                { name: 'Palavra detectada', value: `"${foundWord}"`, inline: true }
                            )
                            .setFooter({ text: `Ação registrada em ${new Date().toLocaleString()}`, iconURL: message.guild.iconURL() })
                            .setTimestamp();

                        await discordChannel.send({ embeds: [logEmbed], ephemeral: true });
                        logger.debug('Log detalhado enviado para canal', context);
                    } catch (logEmbedError) {
                        logger.warn('Erro ao enviar embed de log', context, logEmbedError);
                    }
                }

            } catch (deleteError) {
                logger.error('Erro ao deletar mensagem com palavra inadequada', context, deleteError);
                securityEvent('MESSAGE_DELETE_FAILED', message.author, message.guild, deleteError.message);
            }
        }

    } catch (error) {
        logger.error('Erro na detecção de palavras inadequadas', context, error);

        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (discordChannel) {
            try {
                await discordChannel.send(`Erro ao tentar deletar mensagem de ${message.author.tag} por palavras inadequadas! ${error.message}`);
            } catch (logError) {
                logger.error('Erro ao enviar log de erro', context, logError);
            }
        }
    }
}

module.exports = { detectInappropriateWords };
