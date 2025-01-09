const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const channelsIdBLockeds = require('../models/onAddChannelSchema');

async function getBlockedChannels() {
    try {
        const channels = await channelsIdBLockeds.find();
        return channels.map(channel => channel.channelId);
    } catch (error) {
        console.error("Erro ao buscar canais bloqueados:", error);
        return [];
    }
}

async function checkingComandChannelBlocked(interaction) {
    const { channelId } = interaction

    const channelsIdBLocke = await getBlockedChannels();

    if (channelsIdBLocke.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }

    return true;
}

async function checkingComandExecuntionModerador(interaction) {
    const { member } = interaction;

    if (!member.roles.cache.has(process.env.CARGO_MODERADOR)) {
        await interaction.deferReply( { ephemeral: true } );

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

        await interaction.editReply({ embeds: [embed], ephemeral: true });
        return false;
    }

    return true;
}


module.exports = { checkingComandChannelBlocked, checkingComandExecuntionModerador, getBlockedChannels };