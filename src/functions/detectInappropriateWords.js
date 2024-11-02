const { client } = require('../Client');
const { info, erro } = require('../logger');
const inappropriateWordsData = require('../config/inappropriateWords.json');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

const inappropriateWords = inappropriateWordsData.inappropriateWords;

async function detectInappropriateWords(message) {
    if (message.author.bot) return;
    if (!blockedChannels.includes(message.channel.id)) return;

    const foundWord = inappropriateWords.find(word =>
        message.content.toLowerCase().includes(word.toLowerCase())
    );

    if (foundWord) {
        try {
            await message.member.timeout(300000, 'Uso de linguagem imprópria');
            await message.channel.send(`🚫 ${message.author}, você usou uma linguagem inadequada. Você foi silenciado por 5 minutos.`);
            await message.author.send(`⚠️ Você foi silenciado no servidor ${message.guild.name} por 5 minutos devido ao uso de linguagem inadequada.`);

            info.info(`Timeout de 5 minutos aplicado para ${message.author.tag} por linguagem imprópria.`);

            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            discordChannel.send(`${message.author.tag} foi silenciado no servidor ${message.guild.name} por 5 minutos devido ao uso de linguagem inadequada.`);
            
        } catch (error) {
            erro.error(`Erro ao aplicar timeout em ${message.author.tag}:`, error);
        }
    }
}

module.exports = { detectInappropriateWords };