const { EmbedBuilder } = require('discord.js');
const blockedLinksData = require('../../config/blockedLinks.json');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const axios = require('axios')

const blockedLinks = blockedLinksData.blockedLinks.map(pattern => new RegExp(pattern));

async function blockLinks(message) {
    if (message.author.bot) return;
    
    if (blockedChannels.includes(message.channel.id)) {
        const isBlocked = blockedLinks.some(regex => regex.test(message.content));

        if (isBlocked) {
            await message.delete();

            const serverUrl = 'https://jonalandia-server.vercel.app/users';
            const payload = {
                username: message.author.username,
                avatarUrl: message.author.displayAvatarURL(),
                accountCreatedDate: message.author.createdAt,
                joinedServerDate: message.member.joinedAt,
                infraction: 'serverLinksPosted',
                reason: `Mensagem bloqueada por conter links .`,
                moderator: client.user.username,
            };

            try {
                await axios.post(`${serverUrl}/${message.author.username}`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                });
                info.info(`Infração registrada no backend para o usuário ${message.author.tag}.`);
            } catch (backendError) {
                erro.error(`Erro ao enviar dados para o backend: ${backendError.message}`);
            }

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
                .setFooter({ text: `Envio de links monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

            await message.channel.send({ content: `${message.author}`, embeds: [embed] });

            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            discordChannel.send(`Link bloqueado detectado e deletado no canal ${message.channel.name} por ${message.author.tag}`);
            
            info.info(`Link bloqueado detectado e deletado no canal ${message.channel.name} por ${message.author.tag}`);
        }
    }
}

module.exports = { blockLinks };