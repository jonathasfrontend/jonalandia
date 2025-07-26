const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { logger, commandExecuted, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function timeout(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;
    const context = {
        module: 'MODERATION',
        command: 'timeout',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando timeout', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando timeout bloqueado - canal não autorizado', context);
        return;
    }
    
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando timeout negado - usuário sem permissão de moderador', context);
        return;
    }

    try {
        if (commandName === 'timeout') {
            await interaction.deferReply({ ephemeral: true });

            const userToTimeout = options.getUser('usuario');
            const guildMember = interaction.guild.members.cache.get(userToTimeout.id);

            if (!guildMember) {
                logger.warn(`Usuário ${userToTimeout.tag} não encontrado no servidor`, context);
                await interaction.editReply({ content: 'Usuário não encontrado no servidor.', ephemeral: true });
                return;
            }

            logger.info(`Aplicando timeout em usuário: ${userToTimeout.tag}`, {
                ...context,
                targetUser: userToTimeout.tag
            });

            const reason = `O usuário ${userToTimeout.tag} recebeu um timeout de 3 minutos.`;
            const type = 'timeouts';

            saveUserInfractions(
                userToTimeout.id,
                userToTimeout.tag,
                userToTimeout.displayAvatarURL({ dynamic: true }),
                guildMember.user.createdAt,
                guildMember.joinedAt,
                type,
                reason,
                member.user.tag
            )

            await guildMember.timeout(3 * 60 * 1000, 'Timeout de 3 minutos aplicado pelo bot');
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Timeout aplicado')
                .setDescription(`O usuário ${userToTimeout.tag} recebeu um timeout de 3 minutos.`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.editReply({ embeds: [embed] });

            commandExecuted('timeout', interaction.user, interaction.guild, true);
            securityEvent('USER_TIMEOUT', userToTimeout, interaction.guild, `Timeout de 3 minutos aplicado por ${interaction.user.tag}`);

            logger.info(`Timeout aplicado com sucesso em ${userToTimeout.tag}`, {
                ...context,
                targetUser: userToTimeout.tag,
                duration: '3 minutos'
            });
        }
    } catch (error) {
        logger.error('Erro ao aplicar timeout', context, error);
        commandExecuted('timeout', interaction.user, interaction.guild, false);
    }
};

module.exports = { timeout };
