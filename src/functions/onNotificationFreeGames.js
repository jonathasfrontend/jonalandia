const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const GameNotification = require('../models/gameNotificationSchema');
const { client } = require('../Client');
const { info, erro } = require('../logger');

async function onNotificationFreeGames() {
    try {
        const response = await axios.get('https://www.freetogame.com/api/games?platform=pc');
        const games = response.data;

        const selectedGames = games.sort(() => 0.5 - Math.random()).slice(0, 3);

        for (const game of selectedGames) {
            const gameExists = await GameNotification.findOne({ id: game.id });

            if (!gameExists) {
                await GameNotification.create({
                    id: game.id,
                    title: game.title,
                    genre: game.genre,
                    platform: game.platform,
                    release_date: game.release_date,
                });

                const channel = client.channels.cache.get(process.env.CHANNEL_ID_NOVIDADES);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle(game.title)
                        .setDescription(game.short_description)
                        .addFields(
                            { name: 'Gênero', value: game.genre, inline: true },
                            { name: 'Plataforma', value: game.platform, inline: true },
                            { name: 'Lançamento', value: game.release_date, inline: true },
                        )
                        .setURL(game.game_url)
                        .setImage(game.thumbnail)
                        .setFooter({ text: 'Jogo gratuito disponível!' });

                    await channel.send({ embeds: [embed] });
                    info.info(`Jogo gratuito notificado: ${game.title}`);
                }
            }
        }
    } catch (error) {
        erro.error('Erro ao notificar jogos gratuitos:', error);
    }
}

function scheduleonNotificationFreeGamesCheck(){
    cron.schedule('0 13 * * *', () => {
        onNotificationFreeGames();
    });
}

module.exports = { scheduleonNotificationFreeGamesCheck };
