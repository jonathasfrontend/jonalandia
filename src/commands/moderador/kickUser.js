const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../logger');
const { getApiUrl } = require('../../api');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const kickUser = async (interaction) => {
    if (!interaction.isCommand()) return;

    const userToKick = interaction.options.getUser('usuario');
    const { channelId } = interaction;

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

    const initiator = interaction.member;
    if (!initiator.roles.cache.has(process.env.CARGO_MODERADOR)) {
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

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const member = guild.members.cache.get(userToKick.id);

    if (!initiator.voice.channel) {
        await interaction.editReply({ content: "Você precisa estar em um canal de voz para usar este comando." });
        return;
    }

    if (!member.voice.channel || member.voice.channel.id !== initiator.voice.channel.id) {
        await interaction.editReply({ content: "O usuário selecionado não está no mesmo canal de voz que você." });
        return;
    }

    try {
        const payload = {
            username: member.user.username,
            avatarUrl: member.user.displayAvatarURL({ dynamic: true }),
            accountCreatedDate: member.user.createdAt,
            joinedServerDate: member.joinedAt,
            infraction: 'voiceChannelKicks',
            reason: `Usuário expulso do canal de voz.`,
            moderator: initiator.user.tag,
        };

        try {
            const api = getApiUrl();
            await api.post(`/users/${member.user.username}`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            info.info(`Infração registrada no backend para o usuário ${member.user.username}.`);
        } catch (backendError) {
            erro.error(`Erro ao registrar infração no backend para o usuário ${member.user.username} - ${backendError.message}`);            
        }

        await member.voice.disconnect();
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle("Usuário Expulso")
                    .setDescription(`${member.user.tag} foi expulso do canal de voz.`),
            ],
        });

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        discordChannel2.send(`Usuário ${member.user.tag} foi expulso do canal de voz por ${initiator.user.tag}.`);

    } catch (error) {
        erro.error(error);
        await interaction.editReply({
            content: "Não foi possível expulsar o usuário do canal de voz.",
        });
    }
};

module.exports = { kickUser };
