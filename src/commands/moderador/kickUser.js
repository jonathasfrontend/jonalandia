const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require("../../utils/saveUserInfractions");
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function kickUser(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;

    checkingComandChannelBlocked(interaction);
    checkingComandExecuntionModerador(interaction);

    try {
        if (commandName === 'kickuser') {
            const userToKick = options.getUser('usuario');

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
