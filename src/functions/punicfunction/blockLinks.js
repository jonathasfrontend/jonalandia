const { EmbedBuilder } = require('discord.js');
const blockedLinksData = require('../../config/blockedLinks.json');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const Users = require('../../models/infracoesUsersSchema');

const blockedLinks = blockedLinksData.blockedLinks.map(pattern => new RegExp(pattern));

async function blockLinks(message) {
    if (message.author.bot) return;
    
    if (blockedChannels.includes(message.channel.id)) {
        const isBlocked = blockedLinks.some(regex => regex.test(message.content));

        if (isBlocked) {
            await message.delete();
            
            const reason = `Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedLinks.find(regex => regex.test(message.content)).source}`;
            const type = 'serverLinksPosted';

            let userData = await Users.findOne({ username: message.author.username });

            if (!userData) {
                userData = new Users({
                    userId: message.author.id,
                    username: message.author.username,
                    avatarUrl: message.author.displayAvatarURL(),
                    accountCreatedDate: message.author.createdAt,
                    joinedServerDate: message.member.joinedAt,
                    infractions: { serverLinksPosted: 1 },
                    logs: [{
                        type,
                        reason,
                        date: new Date(),
                        moderator: client.user.tag,
                    }]
                });
            } else {
                userData.infractions.serverLinksPosted = (userData.infractions.serverLinksPosted || 0) + 1;
                userData.logs.push({
                    type,
                    reason,
                    date: new Date(),
                    moderator: client.user.tag,
                });
            }

            await userData.save();

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
            discordChannel.send(`Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedLinks.find(regex => regex.test(message.content)).source}`);
            
            info.info(`Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedLinks.find(regex => regex.test(message.content)).source}`);
        }
    }
}

module.exports = { blockLinks };