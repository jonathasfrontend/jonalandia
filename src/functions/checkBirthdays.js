const cron = require('node-cron');
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema');
const { client } = require('../Client');
const { EmbedBuilder } = require('discord.js');
const { info, erro } = require('../logger');

async function checkBirthdays() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const birthdaysToday = await onNotificationBirthdaySchema.find({ day, month });

    birthdaysToday.forEach(async user => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const member = guild.members.cache.get(user.userId);

        if (member) {
            const channel = guild.channels.cache.get(process.env.CHANNEL_ID_ANIVERSARIO);

            const birthdayEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🎉 Feliz Aniversário! 🎉')
                .setDescription(`Parabéns <@${user.userId}>! 🎂🎈🎉 Desejamos a você um dia incrível e muitas felicidades!`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setImage('https://media.istockphoto.com/id/1431551851/pt/vetorial/birthday-cake-vector-background-design-happy-birthday-greeting-text-with-yummy-cake.jpg?s=612x612&w=0&k=20&c=2K8os5-bInEwNGLuHM5SICqrtlKDbmty3EBSWs80WtY=')
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
                
            channel.send({ embeds: [birthdayEmbed] });
            info.info(`parabéns a ${member.user.tag} enviado com sucesso.`);

            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel.send(`Parabéns a ${member.user.tag} enviado com sucesso.`)
        }
    });
}

function scheduleBirthdayCheck() {
    cron.schedule('0 0 * * *', () => {
        checkBirthdays();
        info.info('Verificando aniversariantes e enviando mensagens de parabéns.');
    });
}

module.exports = { scheduleBirthdayCheck };