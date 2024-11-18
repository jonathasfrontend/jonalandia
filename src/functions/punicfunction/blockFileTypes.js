const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const blockedFileExtensions = require('../../config/blockedFileExtensions.json').blockedFileExtensions;
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;
const { info, erro } = require('../../logger');
const axios = require('axios')

async function blockFileTypes(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;

    // Verifique se o canal está na lista de canais bloqueados
    if (blockedChannels.includes(message.channel.id)) {
        // Verifica se existem anexos
        if (message.attachments.size > 0) {
            const blockedAttachments = message.attachments.filter(attachment =>
                blockedFileExtensions.some(ext => attachment.name.endsWith(ext))
            );

            // Se algum anexo tiver uma extensão bloqueada, exclua a mensagem e avise
            if (blockedAttachments.size > 0) {
                await message.delete();

                const serverUrl = 'https://jonalandia-server.vercel.app/users';
                const payload = {
                    username: message.author.username,
                    avatarUrl: message.author.displayAvatarURL(),
                    accountCreatedDate: message.author.createdAt,
                    joinedServerDate: message.member.joinedAt,
                    infraction: 'blockedFiles',
                    reason: `Tentativa de envio de arquivo com extensão bloqueada: ${blockedAttachments.map(att => att.name).join(', ')}`,
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
                    .setTitle('Arquivo Bloqueado')
                    .setDescription(`${message.author}, o envio de arquivos com certas extensões é proibido neste servidor.`)
                    .setTimestamp()
                    .setFooter({ text: `Envio de arquivos monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                await message.channel.send({ embeds: [embed], content: `${message.author}` });

                // Envia um log para o canal de logs
                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                discordChannel.send(`${message.author} tentou enviar um arquivo com extensão bloqueada em um canal restrito!`);
            }
        }
    }
}

module.exports = { blockFileTypes };