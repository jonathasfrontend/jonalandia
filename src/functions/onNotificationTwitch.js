const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const onNotificationTwitchSchema = require("../models/onNotificationTwitchSchema")
const logger = require('../logger');

const streamers = [
    'gabepeixe',
    'loud_coringa',
    'alanzoka',
    'piuzinho',
    'cyntia',
    'todurooficial',
    'ovotz',
    'ruyterpoubel0',
    'alvezerarp',
    'MagrinhoDoRp',
    'Coreano',
    'Bisteconee',
    'rauzin',
    'coelhagg',
    'cblol',
    'mqs1',
    'Ferbr',
    'guip1_',
];

async function onNotificationTwitch() {
    for (let streamer of streamers) {
        try {
            const uptimeResponse = await axios.get(`https://decapi.me/twitch/uptime/${streamer}`);
            const avatarResponse = await axios.get(`https://decapi.me/twitch/avatar/${streamer}`);
            const titleResponse = await axios.get(`https://decapi.me/twitch/title/${streamer}`);
            const gameResponse = await axios.get(`https://decapi.me/twitch/game/${streamer}`);
            const imageResponse = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamer}-440x248.jpg`

            if (uptimeResponse.data !== `${streamer} is offline`) {
                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: `${streamer}`,
                        iconURL: `${avatarResponse.data}`,
                    })
                    .setTitle(`${titleResponse.data}`)
                    .setThumbnail(`${avatarResponse.data}`)
                    .setDescription(`<@&1253361488274657344> ${streamer} está online **Vá Ve-lo**`)
                    .addFields(
                        { name: 'Game', value: `${gameResponse.data}` },
                    )
                    .setImage(imageResponse)
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_NOTIFICATION_TWITCH);

                if(await onNotificationTwitchSchema.findOne({title: titleResponse.data})){
                    logger.info(`Notificação Twitch para o título "${titleResponse.data}" já existe no banco de dados.`);
                } else {
                    await discordChannel.send({ embeds: [embed] });

                    const newNotification = new onNotificationTwitchSchema({
                        title: titleResponse.data,
                        streamer: streamer,
                        image: imageResponse,
                        gamer: gameResponse.data,
                    });

                    await newNotification.save();
                    logger.info(`Notificação Twitch para o título "${titleResponse.data}" armazenada no banco de dados.`);
                }

            }
        } catch (error) {
            logger.info(error);
        }
    }
}

module.exports = { onNotificationTwitch };

setInterval(onNotificationTwitch, 300000); // 5 minutos
