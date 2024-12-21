const { client } = require("../Client");
const { info, erro } = require('../Logger');
const onNotificationTwitchSchema = require("../models/onNotificationTwitchSchema");
const onTwitchStreamersSchema = require("../models/onTwitchStreamersSchema");
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');

async function onNotificationTwitch() {
    const streamersData = await onTwitchStreamersSchema.find({});

    for (let streamer of streamersData.map(streamer => streamer.name)) {

        try {
            const uptimeResponse = await axios.get(`https://decapi.me/twitch/uptime/${streamer}`);
            const avatarResponse = await axios.get(`https://decapi.me/twitch/avatar/${streamer}`);
            const titleResponse = await axios.get(`https://decapi.me/twitch/title/${streamer}`);
            const gameResponse = await axios.get(`https://decapi.me/twitch/game/${streamer}`);
            const imageResponse = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamer}-440x248.jpg`;

            if (`${streamer} is offline`) {
                info.info(`${streamer} está offline.`);
            }

            if (streamer === 'undefined') {
                erro.error('Streamer não foi encontrado!');
            }

            if (uptimeResponse.data !== `${streamer} is offline`) {
                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: `${streamer}`,
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

                if(await onNotificationTwitchSchema.findOne({title: titleResponse.data})){
                    info.info(`Notificação Twitch para o título "${titleResponse.data}" já existe no banco de dados.`);
                } else {
                    await discordChannel.send({ embeds: [embed] });
                    
                    const newNotification = new onNotificationTwitchSchema({
                        title: titleResponse.data,
                        streamer: streamer,
                        image: imageResponse,
                        gamer: gameResponse.data,
                    });

                    await newNotification.save();
                    info.info(`Notificação Twitch para o título "${titleResponse.data}" armazenada no banco de dados.`);
                }
            }
        } catch (error) {
            erro.error(error);
        }
    }
}

function scheduleNotificationTwitchCheck() {
    cron.schedule('*/5 * * * *', () => { 
        onNotificationTwitch();
    });
}

module.exports = { scheduleNotificationTwitchCheck };