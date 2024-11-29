const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const blockedFileExtensions = require('../../config/blockedFileExtensions.json').blockedFileExtensions;
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;
const { info, erro } = require('../../Logger');
const Users = require('../../models/infracoesUsersSchema');

async function blockFileTypes(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;

    if (blockedChannels.includes(message.channel.id)) {
        if (message.attachments.size > 0) {
            const blockedAttachments = message.attachments.filter(attachment =>
                blockedFileExtensions.some(ext => attachment.name.endsWith(ext))
            );
            
            if (blockedAttachments.size > 0) {
                await message.delete();

                const reason = `Tentativa de envio de arquivo com extensão bloqueada: ${blockedAttachments.map(att => att.name).join(', ')}`;
                const type = 'blockedFiles';

                let userData = await Users.findOne({ username: message.author.username });

                if (!userData) {
                    userData = new Users({
                        userId: message.author.id,
                        username: message.author.username,
                        avatarUrl: message.author.displayAvatarURL(),
                        accountCreatedDate: message.author.createdAt,
                        joinedServerDate: message.member.joinedAt,
                        infractions: { blockedFiles: 1 },
                        logs: [{
                            type,
                            reason,
                            date: new Date(),
                            moderator: client.user.tag,
                        }]
                    });
                } else {
                    userData.infractions.blockedFiles = (userData.infractions.blockedFiles || 0) + 1;
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
                    .setTitle('Arquivo Bloqueado')
                    .setDescription(`${message.author}, o envio de arquivos com certas extensões é proibido neste servidor.`)
                    .setTimestamp()
                    .setFooter({ text: `Envio de arquivos monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                await message.channel.send({ embeds: [embed], content: `${message.author}` });

                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                discordChannel.send(`${message.author} tentou enviar um arquivo com extensão bloqueada em um canal restrito!`);
            }
        }
    }
}

module.exports = { blockFileTypes };