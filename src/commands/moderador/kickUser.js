const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require("../../utils/saveUserInfractions");
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function kickUser(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, channelId, member } = interaction;

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
        await interaction.editReply({ embeds: [embed], ephemeral: true });
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
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
    }

    try {
        if (commandName === 'kickuser') {
            const userToKick = interaction.options.getUser('usuario');

            if (!userToKick) {
                await interaction.reply({ content: "Por favor, selecione um usuário.", ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const memberToKick = guild.members.cache.get(userToKick.id);

            if (!interaction.member.voice.channel) {
                await interaction.editReply({ content: "Você precisa estar em um canal de voz para usar este comando." });
                return;
            }

            if (!memberToKick.voice.channel || memberToKick.voice.channel.id !== interaction.member.voice.channel.id) {
                await interaction.editReply({ content: "O usuário selecionado não está no mesmo canal de voz que você." });
                return;
            }

            const reason = `Usuário ${userToKick.tag} expulso do canal de voz.`;
            const type = 'voiceChannelKicks';

            saveUserInfractions(
                userToKick.id,
                userToKick.tag,
                userToKick.displayAvatarURL({ dynamic: true }),
                userToKick.createdAt,
                memberToKick.joinedAt,
                type,
                reason,
                member.user.tag
            )

            await memberToKick.voice.disconnect();

            const voiceChannel = memberToKick.voice.channel;
            if (voiceChannel) {
                await memberToKick.voice.disconnect();

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`🚪 Usuário expulso do canal de voz`)
                    .setDescription(`O usuário ${userToKick.tag} foi expulso do canal de voz ${voiceChannel.name} com sucesso.`)
                    .setTimestamp()
                    .setFooter({ text: `Ação realizada por ${member.user.tag}` });

                await interaction.editReply({ embeds: [embed] });

                const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                await logChannel.send(`O usuário ${memberToKick.user.tag} foi expulso do canal de voz.`);

            } else {
                await interaction.editReply({ content: "O usuário não está em um canal de voz atualmente." });
            }

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`O usuário ${memberToKick.user.tag} foi expulso do canal de voz ${voiceChannel.name}.`);

            info.info(`O usuário ${memberToKick.user.tag} foi expulso do canal de voz ${voiceChannel.name}.`);
        }
    } catch (error) {
        erro.error('Erro ao expulsar usuário do canal de voz', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao expulsar usuário do canal de voz: ${error}`);
    }
};

module.exports = { kickUser };
