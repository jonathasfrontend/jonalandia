const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const kickUser = async (interaction) => {
    if (!interaction.isCommand()) return;
    const userToKick = interaction.options.getUser('usuario');

    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1254199140796207165> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!member.roles.cache.has(process.env.CARGO_MODERADOR)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription('Você não tem permissão para usar este comando.')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!userToKick) {
        await interaction.reply({ content: "Por favor, selecione um usuário.", ephemeral: true });
        return;
    }

    const guild = interaction.guild;
    const member = guild.members.cache.get(userToKick.id);
    const initiator = guild.members.cache.get(interaction.user.id);

    if (!initiator.voice.channel) {
        await interaction.reply({ content: "Você precisa estar em um canal de voz para usar este comando.", ephemeral: true });
        return;
    }

    if (!member.voice.channel || member.voice.channel.id !== initiator.voice.channel.id) {
        await interaction.reply({ content: "O usuário selecionado não está no mesmo canal de voz que você.", ephemeral: true });
        return;
    }

    try {
        await member.voice.disconnect();
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle("Usuário Expulso")
            .setDescription(`${member.user.tag} foi expulso do canal de voz.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel2.send(`Usuário ${member.user.tag} foi expulso do canal de voz por ${initiator.user.tag}.`);

        info.info(`Usuário ${member.user.tag} foi expulso do canal de voz por ${initiator.user.tag}.`);
    } catch (error) {
        erro.error(error);
        await interaction.reply({ content: "Não foi possível expulsar o usuário do canal de voz.", ephemeral: true });
    }
};

module.exports = { kickUser };
