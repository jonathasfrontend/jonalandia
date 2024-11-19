const { Collection, italic } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../logger');
const { getApiUrl } = require('../../api');
const members = new Collection();

async function antiFloodChat(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;
    if (message.author.id === message.guild.ownerId) return;

    const { author, channel, member } = message;
    if (member && member.roles.cache.has(process.env.CARGO_MODERADOR)) return;

    const count = members.get(author.id);
    if (!count) {
        members.set(author.id, 1);
        return;
    }

    const newCount = count + 1;
    members.set(author.id, newCount);

    if (newCount >= 5) {
        members.delete(author.id);

        const payload = {
            username: message.author.username,
            avatarUrl: message.author.displayAvatarURL(),
            accountCreatedDate: message.author.createdAt,
            joinedServerDate: message.member.joinedAt,
            infraction: 'floodTimeouts',
            reason: `Flood de mensagens`,
            moderator: client.user.username,
        };

        try {
            const api = getApiUrl();
            await api.post(`/users/${message.author.username}`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            info.info(`Infração registrada no backend para o usuário ${message.author.username}.`);
        } catch (backendError) {
            erro.error(`Erro ao registrar infração no backend para o usuário ${message.author.username} - ${backendError.message}`);            
        }

        // Timeout do membro
        member?.timeout(60_000, "Flood de mensagens");
        info.info(`${author} levou timeout por flood de mensagem!`);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`${author} evite o flood de mensagens por favor! > leia as regras para evitar punições severas ${italic('Você poderá enviar mensagens novamente em breve...')}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Envio de mensegens simultaneas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

        message.reply({ content: `||${author}||`, embeds: [embed], ephemeral: true });

        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel.send(`${author} levou timeout por flood de mensagem!`)

        info.info(`${author} levou timeout por flood de mensagem!`);

        setTimeout(() => message.delete().catch(() => {}, 60_000));
        return;
    }

    setTimeout(() => {
        const currCount = members.get(author.id);
        if (!currCount) return;
        members.set(author.id, currCount - 1);
    }, 6000);
}

module.exports = { antiFloodChat };
