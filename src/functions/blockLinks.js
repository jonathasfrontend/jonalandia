const { EmbedBuilder } = require('discord.js');
const blockedLinks = require('../config/blockedLinks');
const blockedChannels = require('../config/blockedChannels');
const { client } = require('../Client');
const { info, erro } = require('../logger');

async function blockLinks(message) {
    if (message.author.bot) return;
    
    if (blockedChannels.includes(message.channel.id)) {
        const isBlocked = blockedLinks.some(regex => regex.test(message.content));

        if (isBlocked) {
            await message.delete(); // Deleta a mensagem com o link

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('Link bloqueado detectado! ❌')
                .setDescription('Você não pode enviar links de outros servidores ou links do Steam aqui.')
                .setTimestamp()
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await message.channel.send({ content: `${message.author}`, embeds: [embed] });

            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel.send(`Link bloqueado detectado e deletado no canal ${message.channel.name} por ${message.author.tag}`)
            
            info.info(`Link bloqueado detectado e deletado no canal ${message.channel.name} por ${message.author.tag}`);
        }
    }
}

module.exports = { blockLinks };
