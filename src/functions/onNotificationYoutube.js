const { client } = require("../Client");
const { logger, botEvent, databaseEvent } = require('../logger');
const onNotificationYoutubeSchema = require('../models/onNotificationYoutubeSchema');
const onYoutubeChannelSchema = require('../models/onYoutubeChannelSchema');
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');

async function onNotificationYoutube() {
    const context = { module: 'YOUTUBE_NOTIFICATIONS' };

    logger.debug('Iniciando verificação de notificações YouTube', context);

    try {
        const channelsData = await onYoutubeChannelSchema.find({});
        databaseEvent('SELECT', 'YoutubeChannels', true, `Buscando canais cadastrados`);

        if (channelsData.length === 0) {
            logger.debug('Nenhum canal YouTube cadastrado para monitoramento', context);
            return;
        }

        logger.info(`Verificando ${channelsData.length} canal(is) YouTube`, context);

        for (let channelData of channelsData) {
            const channel = channelData.name;
            const channelContext = {
                ...context,
                channel
            };

            try {
                logger.debug(`Verificando último vídeo do canal: ${channel}`, channelContext);

                // Fazendo a requisição para a API DecAPI para pegar o último vídeo
                const latestVideoResponse = await axios.get(`https://decapi.me/youtube/latest_video?user=@${channel}`);

                if (latestVideoResponse.data === 'User not found') {
                    logger.warn(`Canal ${channel} não foi encontrado na API`, channelContext);
                    botEvent('YOUTUBE_CHANNEL_NOT_FOUND', `Canal ${channel} não encontrado`);
                    continue;
                }

                // Extraindo informações da resposta da API
                const responseData = latestVideoResponse.data.trim();

                // Separando título e URL do vídeo
                const lastHyphenIndex = responseData.lastIndexOf(' - ');
                if (lastHyphenIndex === -1) {
                    logger.warn(`Formato de resposta inválido para o canal ${channel}`, channelContext);
                    botEvent('YOUTUBE_INVALID_RESPONSE', `Formato inválido para canal ${channel}`);
                    continue;
                }

                const title = responseData.substring(0, lastHyphenIndex);
                const videoUrl = responseData.substring(lastHyphenIndex + 3);

                // Extraindo o ID do vídeo da URL
                const videoIdMatch = videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                if (!videoIdMatch) {
                    logger.warn(`Não foi possível extrair o ID do vídeo para o canal ${channel}`, channelContext);
                    botEvent('YOUTUBE_VIDEO_ID_ERROR', `Erro ao extrair ID do vídeo para ${channel}`);
                    continue;
                }

                const videoId = videoIdMatch[1];
                const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;

                logger.debug(`Vídeo encontrado: "${title}" do canal ${channel}`, {
                    ...channelContext,
                    title,
                    videoId
                });

                // Verificando se a notificação já existe no banco de dados
                const existingNotification = await onNotificationYoutubeSchema.findOne({ title: title });
                databaseEvent('SELECT', 'YoutubeNotifications', true, `Verificando notificação existente para: ${title}`);

                if (existingNotification) {
                    logger.debug(`Notificação YouTube para "${title}" já existe no banco de dados`, channelContext);
                } else {
                    logger.info(`Novo vídeo detectado para ${channel}`, {
                        ...channelContext,
                        title,
                        videoUrl
                    });

                    botEvent('YOUTUBE_NEW_VIDEO_DETECTED', `${channel}: ${title}`);

                    try {
                        // Criando o embed
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setAuthor({
                                name: `Youtube - ${channel}`,
                            })
                            .setTitle(`${title}`)
                            .setDescription(`${channel} postou um novo vídeo! **Vá assisti-lo**`)
                            .setURL(videoUrl)
                            .setImage(thumbnailUrl)
                            .setTimestamp()
                            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_NOTIFICATION_YOUTUBE);

                        if (!discordChannel) {
                            logger.error('Canal de notificações YouTube não encontrado', channelContext);
                            continue;
                        }

                        // Enviando a notificação
                        await discordChannel.send({ embeds: [embed] });
                        logger.info(`Notificação YouTube enviada para ${channel}`, {
                            ...channelContext,
                            title
                        });

                        botEvent('YOUTUBE_NOTIFICATION_SENT', `${channel}: ${title}`);

                        // Salvando no banco de dados
                        const newNotification = new onNotificationYoutubeSchema({
                            title: title,
                            author: channel,
                            thumbnail: thumbnailUrl,
                            description: `${channel} postou um novo vídeo!`,
                        });

                        await newNotification.save();
                        databaseEvent('INSERT', 'YoutubeNotifications', true, `Notificação salva para ${channel}: ${title}`);

                        logger.info(`Notificação YouTube para "${title}" armazenada no banco de dados`, channelContext);

                    } catch (notificationError) {
                        logger.error('Erro ao enviar/salvar notificação YouTube', channelContext, notificationError);
                        databaseEvent('INSERT', 'YoutubeNotifications', false, notificationError.message);
                    }
                }

            } catch (channelError) {
                logger.error(`Erro ao processar canal ${channel}`, channelContext, channelError);
                botEvent('YOUTUBE_CHANNEL_ERROR', `Erro ao processar ${channel}: ${channelError.message}`);
            }
        }

        logger.debug('Verificação de notificações YouTube concluída', context);

    } catch (error) {
        logger.error('Erro na verificação de notificações YouTube', context, error);
        databaseEvent('SELECT', 'YoutubeChannels', false, error.message);
        botEvent('YOUTUBE_NOTIFICATIONS_ERROR', `Erro geral: ${error.message}`);
    }
}

function scheduleNotificationYoutubeCheck() {
    const context = { module: 'YOUTUBE_NOTIFICATIONS' };

    try {
        cron.schedule('*/1 * * * *', () => {
            logger.debug('Executando verificação automática de YouTube', context);
            botEvent('YOUTUBE_CHECK_SCHEDULED', 'Verificação automática de YouTube executada');
            onNotificationYoutube();
        });

        logger.info('Agendador de notificações YouTube configurado com sucesso (a cada 5 minutos)', context);
        botEvent('YOUTUBE_SCHEDULER_CONFIGURED', 'Agendador configurado para executar a cada 5 minutos');

    } catch (error) {
        logger.error('Erro ao configurar agendador de notificações YouTube', context, error);
    }
}

module.exports = { scheduleNotificationYoutubeCheck }