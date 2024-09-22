const cron = require('node-cron');
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema')
const { client } = require('../Client');

async function checkBirthdays() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    // Busca os aniversariantes de hoje
    const birthdaysToday = await onNotificationBirthdaySchema.find({ day, month });

    birthdaysToday.forEach(user => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID); // Substitua com o ID do seu servidor
        const member = guild.members.cache.get(user.userId);
        
        if (member) {
            const channel = guild.channels.cache.get(process.env.CHANNEL_ID_ANIVERSARIO); // Substitua com o ID do canal
            if (channel) {
                channel.send(`🎉 Parabéns <@${user.userId}>! Hoje é o seu aniversário! 🎉`);
            }
        }
    });
}

// Agendamento diário para rodar à meia-noite
function scheduleBirthdayCheck() {
    cron.schedule('0 0 * * *', () => {
        checkBirthdays();
    });
}

module.exports = { checkBirthdays, scheduleBirthdayCheck };
