const { client } = require("../Client");
const { logger, botEvent, databaseEvent } = require('../logger');
const onNotificationTwitchSchema = require("../models/onNotificationTwitchSchema");
const onTwitchStreamersSchema = require("../models/onTwitchStreamersSchema");
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');

async function onNotificationTwitch() {
    const context = { module: 'TWITCH_NOTIFICATIONS' };

    logger.debug('Iniciando verificação de notificações Twitch', context);

    try {
        const streamersData = await onTwitchStreamersSchema.find({});
        databaseEvent('SELECT', 'TwitchStreamers', true, `Buscando streamers cadastrados`);

        if (streamersData.length === 0) {
            logger.debug('Nenhum streamer cadastrado para monitoramento', context);
            return;
        }

        logger.info(`Verificando ${streamersData.length} streamer(s) Twitch`, context);

        for (let streamerData of streamersData) {
            const streamer = streamerData.name;
            const streamerContext = {
                ...context,
                streamer
            };

            try {
                logger.debug(`Verificando status do streamer: ${streamer}`, streamerContext);

                const uptimeResponse = await axios.get(`https://decapi.me/twitch/uptime/${streamer}`);
                const avatarResponse = await axios.get(`https://decapi.me/twitch/avatar/${streamer}`);
                const titleResponse = await axios.get(`https://decapi.me/twitch/title/${streamer}`);
                const gameResponse = await axios.get(`https://decapi.me/twitch/game/${streamer}`);
                const imageResponse = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamer}-440x248.jpg`;

                if (uptimeResponse.data === `${streamer} is offline`) {
                    logger.silly(`${streamer} está offline`, streamerContext);
                    continue;
                }

                if (streamer === 'undefined') {
                    logger.error('Streamer com nome inválido encontrado', streamerContext);
                    continue;
                }

                // verifica de o erro teve estatus 429 do erro "Request failed with status code 429"
                if (uptimeResponse.status === 429) {
                    logger.warn(`Limite de requisições excedido para o streamer ${streamer}`, streamerContext);
                    botEvent('TWITCH_RATE_LIMIT', `Limite de requisições excedido para ${streamer}`);
                    continue;
                }

                if (uptimeResponse.data !== `${streamer} is offline`) {
                    logger.info(`${streamer} está online - verificando se já foi notificado`, {
                        ...streamerContext,
                        title: titleResponse.data,
                        game: gameResponse.data
                    });

                    const embed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                            name: `Twitch - ${streamer}`,
                            iconURL: `${avatarResponse.data}`,
                        })
                        .setTitle(`${titleResponse.data}`)
                        .setThumbnail(`${avatarResponse.data}`)
                        .setDescription(`${streamer} está online **Vá Ve-lo**`)
                        .addFields(
                            { name: 'Game', value: `${gameResponse.data}` },
                        )
                        .setImage(imageResponse)
                        .setTimestamp()
                        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_NOTIFICATION_TWITCH);

                    if (!discordChannel) {
                        logger.error('Canal de notificações Twitch não encontrado', streamerContext);
                        continue;
                    }

                    // Verificar se já existe notificação para este título
                    const existingNotification = await onNotificationTwitchSchema.findOne({ title: titleResponse.data });
                    databaseEvent('SELECT', 'TwitchNotifications', true, `Verificando notificação existente para: ${titleResponse.data}`);

                    if (existingNotification) {
                        logger.debug(`Notificação Twitch para "${titleResponse.data}" já existe no banco de dados`, streamerContext);
                    } else {
                        try {
                            await discordChannel.send({ embeds: [embed] });
                            logger.info(`Notificação Twitch enviada para ${streamer}`, {
                                ...streamerContext,
                                title: titleResponse.data,
                                game: gameResponse.data
                            });

                            botEvent('TWITCH_NOTIFICATION_SENT', `${streamer} está online: ${titleResponse.data}`);

                            const newNotification = new onNotificationTwitchSchema({
                                title: titleResponse.data,
                                streamer: streamer,
                                image: imageResponse,
                                gamer: gameResponse.data,
                            });

                            await newNotification.save();
                            databaseEvent('INSERT', 'TwitchNotifications', true, `Notificação salva para ${streamer}: ${titleResponse.data}`);

                            logger.info(`Notificação Twitch para "${titleResponse.data}" armazenada no banco de dados`, streamerContext);

                        } catch (notificationError) {
                            logger.error('Erro ao enviar/salvar notificação Twitch', streamerContext, notificationError);
                            databaseEvent('INSERT', 'TwitchNotifications', false, notificationError.message);
                        }
                    }
                }

            } catch (streamerError) {
                logger.error(`Erro ao verificar streamer ${streamer}`);
                botEvent('TWITCH_CHECK_ERROR', `Erro ao verificar ${streamer}: ${streamerError.message}`);
            }
        }

        logger.debug('Verificação de notificações Twitch concluída', context);

    } catch (error) {
        logger.error('Erro na verificação de notificações Twitch', context, error);
        databaseEvent('SELECT', 'TwitchStreamers', false, error.message);
        botEvent('TWITCH_NOTIFICATIONS_ERROR', `Erro geral: ${error.message}`);
    }
}

function scheduleNotificationTwitchCheck() {
    const context = { module: 'TWITCH_NOTIFICATIONS' };

    try {
        cron.schedule('*/3 * * * *', () => {
            logger.debug('Executando verificação automática de Twitch', context);
            botEvent('TWITCH_CHECK_SCHEDULED', 'Verificação automática de Twitch executada');
            onNotificationTwitch();
        });

        logger.info('Agendador de notificações Twitch configurado com sucesso (a cada 5 minutos)', context);
        botEvent('TWITCH_SCHEDULER_CONFIGURED', 'Agendador configurado para executar a cada 5 minutos');

    } catch (error) {
        logger.error('Erro ao configurar agendador de notificações Twitch', context, error);
    }
}

module.exports = { scheduleNotificationTwitchCheck };