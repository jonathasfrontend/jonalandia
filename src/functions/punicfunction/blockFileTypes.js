const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const blockedFileExtensions = require('../../config/blockedFileExtensions.json').blockedFileExtensions;
const { getBlockedChannels } = require('../../utils/checkingComandsExecution')
const { info, erro } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');

async function blockFileTypes(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;

    const channelsIdBLocke = await getBlockedChannels();

    if (channelsIdBLocke.includes(message.channel.id)) {
        if (message.attachments.size > 0) {
            const blockedAttachments = message.attachments.filter(attachment =>
                blockedFileExtensions.some(ext => attachment.name.endsWith(ext))
            );
            
            if (blockedAttachments.size > 0) {
                await message.delete();

                const reason = `Tentativa de envio de arquivo com extensão bloqueada: ${blockedAttachments.map(att => att.name).join(', ')}`;
                const type = 'blockedFiles';

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


                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Arquivo Bloqueado')
                    .setDescription(`${message.author}, o envio de arquivos com certas extensões é proibido neste servidor.`)
                    .setTimestamp()
                    .setFooter({ text: `Envio de arquivos monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                await message.channel.send({ embeds: [embed], content: `${message.author}` });

                info.info(`O usuário ${message.author.tag} tentou enviar um arquivo com extensão bloqueada em um canal restrito!`);

                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                discordChannel.send(`${message.author} tentou enviar um arquivo com extensão bloqueada em um canal restrito!`);
            } else {
                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                discordChannel.send(`erro ao tentar bloquear o envio de arquivos com extensões bloqueadas!`);

                erro.error(`erro ao tentar bloquear o envio de arquivos com extensões bloqueadas!`);
            }
        }
    }
}

module.exports = { blockFileTypes };