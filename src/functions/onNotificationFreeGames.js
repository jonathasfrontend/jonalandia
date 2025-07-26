const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const GameNotification = require('../models/onGameNotificationSchema');
const { client } = require('../Client');
const { logger, botEvent, databaseEvent } = require('../logger');

async function onNotificationFreeGames() {
    const context = { module: 'FREE_GAMES_NOTIFICATIONS' };
    
    logger.debug('Iniciando verificação de jogos gratuitos', context);

    try {
        logger.debug('Fazendo requisição para API de jogos gratuitos', context);
        const response = await axios.get('https://www.freetogame.com/api/games?platform=pc');
        const games = response.data;

        if (!games || games.length === 0) {
            logger.warn('Nenhum jogo encontrado na API', context);
            return;
        }

        logger.info(`${games.length} jogos encontrados na API`, context);

        // Seleciona 3 jogos aleatórios
        const selectedGames = games.sort(() => 0.5 - Math.random()).slice(0, 3);
        logger.debug(`${selectedGames.length} jogos selecionados para verificação`, context);

        for (const game of selectedGames) {
            const gameContext = {
                ...context,
                gameId: game.id,
                gameTitle: game.title
            };

            try {
                logger.debug(`Verificando se jogo já foi notificado: ${game.title}`, gameContext);
                
                const gameExists = await GameNotification.findOne({ id: game.id });
                databaseEvent('SELECT', 'GameNotifications', true, `Verificando jogo existente: ${game.title}`);

                if (!gameExists) {
                    logger.info(`Novo jogo gratuito detectado: ${game.title}`, gameContext);
                    botEvent('FREE_GAME_DETECTED', `Novo jogo: ${game.title}`);

                    try {
                        // Salva no banco de dados
                        await GameNotification.create({
                            id: game.id,
                            title: game.title,
                            genre: game.genre,
                            platform: game.platform,
                            release_date: game.release_date,
                        });

                        databaseEvent('INSERT', 'GameNotifications', true, `Jogo salvo: ${game.title}`);
                        logger.debug(`Jogo ${game.title} salvo no banco de dados`, gameContext);

                        // Envia notificação no Discord
                        const channel = client.channels.cache.get(process.env.CHANNEL_ID_NOVIDADES);
                        
                        if (!channel) {
                            logger.error('Canal de novidades não encontrado', gameContext);
                            botEvent('FREE_GAMES_CHANNEL_NOT_FOUND', 'Canal de novidades não configurado');
                            continue;
                        }

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
                        
                        logger.info(`Notificação de jogo gratuito enviada: ${game.title}`, gameContext);
                        botEvent('FREE_GAME_NOTIFICATION_SENT', `Notificação enviada: ${game.title}`);

                    } catch (saveError) {
                        logger.error(`Erro ao salvar/notificar jogo: ${game.title}`, gameContext, saveError);
                        databaseEvent('INSERT', 'GameNotifications', false, saveError.message);
                        botEvent('FREE_GAME_SAVE_ERROR', `Erro ao salvar ${game.title}: ${saveError.message}`);
                    }
                } else {
                    logger.debug(`Jogo já foi notificado anteriormente: ${game.title}`, gameContext);
                }

            } catch (gameError) {
                logger.error(`Erro ao processar jogo: ${game.title}`, gameContext, gameError);
                botEvent('FREE_GAME_PROCESS_ERROR', `Erro ao processar ${game.title}: ${gameError.message}`);
            }
        }

        logger.debug('Verificação de jogos gratuitos concluída', context);

    } catch (error) {
        logger.error('Erro na verificação de jogos gratuitos', context, error);
        botEvent('FREE_GAMES_ERROR', `Erro geral: ${error.message}`);
    }
}

function scheduleonNotificationFreeGamesCheck(){
    const context = { module: 'FREE_GAMES_NOTIFICATIONS' };
    
    try {
        cron.schedule('*/5 * * * *', () => { 
            logger.debug('Executando verificação automática de jogos gratuitos', context);
            botEvent('FREE_GAMES_CHECK_SCHEDULED', 'Verificação automática de jogos gratuitos executada');
            onNotificationFreeGames();
        });

        logger.info('Agendador de notificações de jogos gratuitos configurado com sucesso (a cada 5 minutos)', context);
        botEvent('FREE_GAMES_SCHEDULER_CONFIGURED', 'Agendador configurado para executar a cada 5 minutos');

    } catch (error) {
        logger.error('Erro ao configurar agendador de notificações de jogos gratuitos', context, error);
    }
}

module.exports = { scheduleonNotificationFreeGamesCheck };
