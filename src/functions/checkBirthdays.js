const cron = require('node-cron');
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema');
const { client } = require('../Client');
const { EmbedBuilder } = require('discord.js');
const { logger, botEvent, databaseEvent } = require('../logger');

async function checkBirthdays() {
    const context = { module: 'BIRTHDAY' };

    try {
        logger.debug('Iniciando verificação de aniversários', context);

        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;

        logger.debug(`Verificando aniversários para ${day}/${month}`, context);

        const birthdaysToday = await onNotificationBirthdaySchema.find({ day, month });
        databaseEvent('SELECT', 'BirthdayNotifications', true, `Buscando aniversários para ${day}/${month}`);

        if (birthdaysToday.length === 0) {
            logger.debug('Nenhum aniversário encontrado para hoje', context);
            return;
        }

        logger.info(`${birthdaysToday.length} aniversário(s) encontrado(s) para hoje`, context);

        for (const user of birthdaysToday) {
            try {
                const guild = client.guilds.cache.get(process.env.GUILD_ID);
                if (!guild) {
                    logger.error('Guild não encontrada', context);
                    continue;
                }

                const member = guild.members.cache.get(user.userId);
                if (!member) {
                    logger.warn(`Membro ${user.userId} não encontrado no servidor`, context);
                    continue;
                }

                const channel = guild.channels.cache.get(process.env.CHANNEL_ID_ANIVERSARIO);
                if (!channel) {
                    logger.error('Canal de aniversário não encontrado', context);
                    continue;
                }

                const birthdayEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('🎉 Feliz Aniversário! 🎉')
                    .setDescription(`Parabéns <@${user.userId}>! 🎂🎈🎉 Desejamos a você um dia incrível e muitas felicidades!`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setImage('https://media.istockphoto.com/id/1431551851/pt/vetorial/birthday-cake-vector-background-design-happy-birthday-greeting-text-with-yummy-cake.jpg?s=612x612&w=0&k=20&c=2K8os5-bInEwNGLuHM5SICqrtlKDbmty3EBSWs80WtY=')
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                await channel.send({ embeds: [birthdayEmbed] });
                logger.info(`Parabéns enviado para ${member.user.tag}`, {
                    ...context,
                    user: member.user.tag,
                    guild: guild.name
                });

                botEvent('BIRTHDAY_MESSAGE_SENT', `Parabéns enviado para ${member.user.tag}`);

                // Log no canal de logs
                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                if (discordChannel) {
                    try {
                        await discordChannel.send(`Parabéns a ${member.user.tag} enviado com sucesso.`);
                    } catch (logError) {
                        logger.warn('Erro ao enviar log para canal', context, logError);
                    }
                } else {
                    logger.warn('Canal de logs não encontrado', context);
                }

            } catch (userError) {
                logger.error(`Erro ao processar aniversário para ${user.userId}`, context, userError);
            }
        }

    } catch (error) {
        logger.error('Erro na verificação de aniversários', context, error);
        databaseEvent('SELECT', 'BirthdayNotifications', false, error.message);
    }
}

function scheduleBirthdayCheck() {
    const context = { module: 'BIRTHDAY' };

    try {
        cron.schedule('0 0 * * *', () => {
            logger.info('Executando verificação automática de aniversários', context);
            botEvent('BIRTHDAY_CHECK_SCHEDULED', 'Verificação automática de aniversários executada');
            checkBirthdays();
        });

        logger.info('Agendador de aniversários configurado com sucesso (diário às 00:00)', context);
        botEvent('BIRTHDAY_SCHEDULER_CONFIGURED', 'Agendador configurado para executar diariamente às 00:00');

    } catch (error) {
        logger.error('Erro ao configurar agendador de aniversários', context, error);
    }
}

module.exports = { scheduleBirthdayCheck };