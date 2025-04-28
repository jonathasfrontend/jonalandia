const { client } = require("../Client");
const { info, erro } = require('../logger');
const onNotificationYoutubeSchema = require('../models/onNotificationYoutubeSchema')
const onYoutubeChannelSchema = require('../models/onYoutubeChannelSchema')
const { EmbedBuilder } = require("discord.js");
const { google } = require('googleapis');
const cron = require('node-cron');
const youtube = google.youtube({version: 'v3', auth: 'AIzaSyBpv77J9fbBuwDfRtDke0XRST_Db_bHJFk'});

require('dotenv').config()

async function onNotificationYoutube() {
    const channels = await onYoutubeChannelSchema.find({});
    const lastVideoIds = channels.map(channel => ({ [channel]: '1647708800000' })).reduce((acc, cur) => ({ ...acc, ...cur }), {});

    for (let i = 0; i < channels.length; i++) {
        let channelName = channels[i];
        let params = {
            part: 'id',
            q: channelName,
            type: 'channel',
            maxResults: 1
        };

        youtube.search.list(params, async (err, res) => {
            if (err) return info.info('Esseso de requisições a api do google' + err);
            
            let channelId = res.data.items[0].id.channelId;
            let params = {
                part: 'id,snippet',
                channelId: channelId,
                maxResults: 1,
                order: 'date'
            };
            
            youtube.search.list(params, async (err, res) => {
                if (err) return info.info('Esseso de requisições a api do google' + err);
                
                let video = res.data.items[0];
                let videoId = video.id.videoId;
                let title = video.snippet.title;
                let author = video.snippet.channelTitle
                let thumbnail = video.snippet.thumbnails.high.url
                let link = `https://www.youtube.com/watch?v=${videoId}`;
                let description = `${author} postou novo video!`

                if (lastVideoIds[channelId] !== videoId) {
                    lastVideoIds[channelId] = videoId;
                    
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`${title}`)
                        .setDescription(`${description}`)
                        .setURL(`${link}`)
                        .setImage(`${thumbnail}`)

                    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_NOTIFICATION_YOUTUBE);

                    if(await onNotificationYoutubeSchema.findOne({title: title})){
                        info.info(`Notificação Youtube para o título "${title}" já existe no banco de dados.`);
                    } else {
                        discordChannel.send({ embeds: [embed] });
    
                        const newNotification = new onNotificationYoutubeSchema({
                            title: title,
                            author: author,
                            thumbnail: thumbnail,
                            description: description,
                        });
    
                        await newNotification.save();
                        info.info(`Notificação Youtube para o título "${title}" armazenada no banco de dados.`);
                    }
                }
            });
        });
    }
}

function scheduleNotificationYoutubeCheck() {
    cron.schedule('*/5 * * * *', () => {
        onNotificationYoutube();
    });
}

module.exports = { scheduleNotificationYoutubeCheck }