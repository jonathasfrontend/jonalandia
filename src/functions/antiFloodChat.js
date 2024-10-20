const { Collection, italic } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { info, erro } = require('../logger');
const members = new Collection();

function antiFloodChat(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;
    if (message.author.id === message.guild.ownerId) return;

    const { author, channel, member } = message; // Mova isso antes de acessar 'member'

    // Verifique se 'member' está definido antes de acessar os roles
    if (member && member.roles.cache.has(process.env.CARGO_MODERADOR)) return;

    const count = members.get(author.id);
    if (!count) {
        members.set(author.id, 1);
        return;
    }

    const newCount = count + 1;
    members.set(author.id, newCount);

    if (newCount >= 3) {
        members.delete(author.id);

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
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        message.reply({ content: `||${author}||`, embeds: [embed], ephemeral: true });
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
