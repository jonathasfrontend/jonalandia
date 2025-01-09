const { EmbedBuilder } = require('discord.js');
const blockedLinksData = require('../../config/blockedLinks.json');
const { getBlockedChannels } = require('../../utils/checkingComandsExecution');
const { client } = require('../../Client');
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { saveUpdateUserPoints } = require('../../utils/saveUpdateUserPoints');

const blockedLinks = blockedLinksData.blockedLinks.map(pattern => new RegExp(pattern));


async function blockLinks(message) {
    if (message.author.bot) return;
    
    const channelsIdBLocke = await getBlockedChannels()
    
    if (channelsIdBLocke.includes(message.channel.id)) {
        const isBlocked = blockedLinks.some(regex => regex.test(message.content));

        if (isBlocked) {
            await message.delete();
            
            const reason = `Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedLinks.find(regex => regex.test(message.content)).source}`;
            const type = 'serverLinksPosted';

            saveUserInfractions(
                message.author.id,
                message.author.tag,
                message.author.displayAvatarURL({ dynamic: true }),
                message.author.createdAt,
                message.member.joinedAt,
                type,
                reason,
                client.user.tag
            )

            saveUpdateUserPoints(message.author, -200, 0, 0);

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

            info.info(`Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedLinks.find(regex => regex.test(message.content)).source}`);

            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            discordChannel.send(`Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedLinks.find(regex => regex.test(message.content)).source}`);
            
        } else {
            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
            discordChannel.send(`erro ao tentar bloquear o envio de arquivos com extensões bloqueadas!`);

            erro.error(`erro ao tentar bloquear o envio de arquivos com extensões bloqueadas!`);
        }
    }
}

module.exports = { blockLinks };