const { client } = require("../Client");
const { EmbedBuilder } = require("discord.js");
const { google } = require('googleapis');
const youtube = google.youtube({version: 'v3', auth: process.env.TOKEN_API_YT_JONATHAS_OLEVEIRAGMAIL_COM});
const logger = require('../logger');
const onNotificationYoutubeSchema = require('../models/onNotificationYoutubeSchema')

require('dotenv').config()

let channels = [
    'Manual do Mundo',
    'LOUD Coringa',
    'LOUD',
    'Piuzinho',
    'Rocketseat',
    'Ei Nerd',
    'Bruno Fraga',
    'Davi',
    'viniccius13',
    'MW Informatica',
    'Cadê a chave?',
    'Cyntia',
    'Dune',
    'Mayk Brito',
    'PAULINHO O LOKO',
    'Labz',
    'Comédia Maurício Meirelles [OFICIAL]',
    'Cortes do Gabepeixe Oficial',
    'Barbixas',
    'Aqueles Caras',
    'CASTELO CLIPS',
    'Joaninha Camilo',
];

let lastVideoIds = {
    'Manual do Mundo': 1647708800000,
    'LOUD Coringa': 1647708800000,
    'LOUD': 1647708800000,
    'Piuzinho': 1647708800000,
    'Rocketseat': 1647708800000,
    'Ei Nerd': 1647708800000,
    'Bruno Fraga': 1647708800000,
    'Davi': 1647708800000,
    'viniccius13': 1647708800000,
    'MW Informatica': 1647708800000,
    'Cadê a chave?': 1647708800000,
    'Cyntia': 1647708800000,
    'Dune': 1647708800000,
    'Mayk Brito': 1647708800000,
    'PAULINHO O LOKO': 1647708800000,
    'Labz': 1647708800000,
    'Comédia Maurício Meirelles [OFICIAL]': 1647708800000,
    'Cortes do Gabepeixe Oficial': 1647708800000,
    'Barbixas': 1647708800000,
    'Aqueles Caras': 1647708800000,
    'CASTELO CLIPS': 1647708800000,
    'Joaninha Camilo': 1647708800000,
};

async function onNotificationYoutube() {
    for (let i = 0; i < channels.length; i++) {
        let channelName = channels[i];
        let params = {
            part: 'id',
            q: channelName,
            type: 'channel',
            maxResults: 1
        };

        youtube.search.list(params, async (err, res) => {
            if (err) return logger.info('Esseso de requisições a api do google' + err);
            
            let channelId = res.data.items[0].id.channelId;
            let params = {
                part: 'id,snippet',
                channelId: channelId,
                maxResults: 1,
                order: 'date'
            };
            
            youtube.search.list(params, async (err, res) => {
                if (err) return logger.info('Esseso de requisições a api do google' + err);
                
                let video = res.data.items[0];
                let videoId = video.id.videoId;
                let title = video.snippet.title;
                let author = video.snippet.channelTitle
                let thumbnail = video.snippet.thumbnails.high.url
                let link = `https://www.youtube.com/watch?v=${videoId}`;
                let description = `<@&1245128273587998866> ${author} postou novo video!`

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
                        logger.info(`Notificação Youtube para o título "${title}" já existe no banco de dados.`);
                    } else {
                        discordChannel.send({ embeds: [embed] });
    
                        const newNotification = new onNotificationYoutubeSchema({
                            title: title,
                            author: author,
                            thumbnail: thumbnail,
                            description: description,
                        });
    
                        await newNotification.save();
                        logger.info(`Notificação Youtube para o título "${title}" armazenada no banco de dados.`);
                    }

                }
            });
        });
    }
}


setTimeout(onNotificationYoutube, 300000); // 5 minutos