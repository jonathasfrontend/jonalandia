const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger, commandEvent, securityEvent, moderationEvent } = require('../../logger');
const { saveUserInfractions } = require("../../utils/saveUserInfractions");
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function kickUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member, guild, channelId } = interaction;
    const context = {
        module: 'MODERATION_COMMAND',
        command: 'kickuser',
        moderatorId: member.user.id,
        moderatorUsername: member.user.username,
        guildId: guild?.id,
        channelId
    };

    logger.debug('Comando kickuser iniciado', context);
    commandEvent('EXECUTE', 'kickuser', member.user.id, guild?.id);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando kickuser bloqueado por canal', context);
        securityEvent('COMMAND_BLOCKED', `Comando kickuser bloqueado no canal ${channelId}`);
        return;
    }

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando kickuser negado - sem permissões de moderador', context);
        securityEvent('UNAUTHORIZED_MODERATION', `Usuário ${member.user.username} tentou usar kickuser sem permissão`);
        return;
    }

    try {
        const userToKick = options.getUser('usuario');

        if (!userToKick) {
            logger.warn('Nenhum usuário fornecido para o comando kickuser', context);
            commandEvent('ERROR', 'kickuser', member.user.id, guild?.id, 'Usuário não especificado');
            await interaction.reply({ content: "Por favor, selecione um usuário.", ephemeral: true });
            return;
        }

        const kickContext = {
            ...context,
            targetUserId: userToKick.id,
            targetUsername: userToKick.username
        };

        logger.info(`Tentativa de expulsar usuário ${userToKick.username} do canal de voz`, kickContext);

        await interaction.deferReply({ ephemeral: true });

        const memberToKick = guild.members.cache.get(userToKick.id);

        if (!interaction.member.voice.channel) {
            logger.warn('Moderador não está em canal de voz', kickContext);
            commandEvent('ERROR', 'kickuser', member.user.id, guild?.id, 'Moderador não está em canal de voz');
            await interaction.editReply({ content: "Você precisa estar em um canal de voz para usar este comando." });
            return;
        }

        if (!memberToKick.voice.channel || memberToKick.voice.channel.id !== interaction.member.voice.channel.id) {
            logger.warn('Usuário alvo não está no mesmo canal de voz', kickContext);
            commandEvent('ERROR', 'kickuser', member.user.id, guild?.id, 'Usuário não está no mesmo canal');
            await interaction.editReply({ content: "O usuário selecionado não está no mesmo canal de voz que você." });
            return;
        }

        const voiceChannel = memberToKick.voice.channel;
        const reason = `Usuário ${userToKick.tag} expulso do canal de voz.`;
        const type = 'voiceChannelKicks';

        logger.debug(`Salvando infração para usuário ${userToKick.username}`, kickContext);

        // Salvar infração
        saveUserInfractions(
            userToKick.id,
            userToKick.tag,
            userToKick.displayAvatarURL({ dynamic: true }),
            userToKick.createdAt,
            memberToKick.joinedAt,
            type,
            reason,
            member.user.tag
        );

        // Expulsar do canal de voz
        await memberToKick.voice.disconnect();

        logger.info(`Usuário ${userToKick.username} foi expulso do canal de voz ${voiceChannel.name}`, {
            ...kickContext,
            voiceChannelId: voiceChannel.id,
            voiceChannelName: voiceChannel.name
        });

        moderationEvent('VOICE_KICK', `${userToKick.username} expulso do canal ${voiceChannel.name} por ${member.user.username}`);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`🚪 Usuário expulso do canal de voz`)
            .setDescription(`O usuário ${userToKick.tag} foi expulso do canal de voz ${voiceChannel.name} com sucesso.`)
            .setTimestamp()
            .setFooter({ text: `Ação realizada por ${member.user.tag}` });

        await interaction.editReply({ embeds: [embed] });

        commandEvent('SUCCESS', 'kickuser', member.user.id, guild?.id, `${userToKick.username} expulso do canal ${voiceChannel.name}`);
    } catch (error) {
        logger.error('Erro ao expulsar usuário do canal de voz', context, error);
        commandEvent('ERROR', 'kickuser', member.user.id, guild?.id, error.message);

        try {
            await interaction.editReply({
                content: 'Ocorreu um erro ao tentar expulsar o usuário do canal de voz.'
            });
        } catch (replyError) {
            logger.error('Erro ao enviar resposta de erro', context, replyError);
        }
    }
};

module.exports = { kickUser };
