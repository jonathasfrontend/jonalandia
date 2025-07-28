const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { logger, commandExecuted, databaseEvent, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function banUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member } = interaction;
    const context = {
        module: 'MODERATION',
        command: 'banir',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando banir', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando banir bloqueado - canal não autorizado', context);
        return;
    }

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando banir negado - usuário sem permissão de moderador', context);
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: true });

        const userToBan = options.getUser('usuario');
        const memberToBan = await interaction.guild.members.fetch(userToBan.id);

        logger.info(`Iniciando processo de banimento para usuário: ${userToBan.tag}`, {
            ...context,
            targetUser: userToBan.tag
        });

        // Tentativa de enviar DM
        try {
            await userToBan.send("Você foi banido do servidor por atitudes que contrariam as regras do servidor.");
            logger.debug(`DM enviada com sucesso para ${userToBan.tag}`, context);
        } catch (dmError) {
            logger.warn(`Não foi possível enviar DM para ${userToBan.tag}`, context, dmError);
        }

        const reason = `O usuário ${userToBan.tag} foi banido do servidor.`;
        const type = 'bans';

        // Salvar infração no banco de dados
        try {
            await saveUserInfractions(
                userToBan.id,
                userToBan.tag,
                userToBan.displayAvatarURL({ dynamic: true }),
                userToBan.createdAt,
                memberToBan.joinedAt,
                type,
                reason,
                member.user.tag
            );
            databaseEvent('INSERT', 'UserInfractions', true, `Infração registrada para ${userToBan.tag}`);
        } catch (dbError) {
            logger.error('Erro ao salvar infração no banco', context, dbError);
            databaseEvent('INSERT', 'UserInfractions', false, dbError.message);
        }

        // Executar o banimento
        await memberToBan.ban({ reason: "Para dúvidas, fale com o dono do servidor." });

        securityEvent('USER_BANNED', userToBan, interaction.guild, `Banido por ${member.user.tag}`);
        logger.info(`Usuário ${userToBan.tag} banido com sucesso`, context);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Usuário Banido')
            .setDescription(`O usuário ${userToBan.tag} foi banido com sucesso.`)
            .setTimestamp()
            .setFooter({ text: `Ação realizada por ${member.user.tag}` });

        await interaction.editReply({ embeds: [embed] });

        // Log no canal
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`O usuário ${userToBan.tag} foi banido do servidor.`);
                logger.debug('Mensagem de log enviada para canal', context);
            } catch (logError) {
                logger.error('Erro ao enviar log para canal', context, logError);
            }
        } else {
            logger.warn('Canal de logs não encontrado', context);
        }

        commandExecuted('banir', interaction.user, interaction.guild, true);
    } catch (error) {
        logger.error('Erro ao banir usuario', context, error);
        commandExecuted('banir', interaction.user, interaction.guild, false);

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`Erro ao banir usuario: ${error.message}`);
            } catch (logError) {
                logger.error('Erro ao enviar mensagem de erro para canal', context, logError);
            }
        }

        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'Ocorreu um erro ao banir o usuário.', ephemeral: true });
            } catch (replyError) {
                logger.error('Erro ao responder interação após falha', context, replyError);
            }
        } else if (interaction.deferred) {
            try {
                await interaction.editReply({ content: 'Ocorreu um erro ao banir o usuário.' });
            } catch (editError) {
                logger.error('Erro ao editar resposta após falha', context, editError);
            }
        }
    }
};

module.exports = { banUser };
