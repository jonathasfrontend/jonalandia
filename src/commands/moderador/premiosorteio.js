const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger, databaseEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function premioSorteio(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const context = {
        module: 'MODERATION',
        command: 'premiosorteio',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando premiosorteio', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando premiosorteio bloqueado - canal não autorizado', context);
        return;
    }
    
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando premiosorteio negado - usuário sem permissão de moderador', context);
        return;
    }

    try {
        if (commandName === 'premiosorteio') {
            const premio = interaction.options.getString('premio');
            const dono = interaction.user.username;

            logger.debug(`Cadastrando prêmio: ${premio} para ${dono}`, context);

            const novoPremio = new Premio({
                premio,
                dono,
            });

            await novoPremio.save();
            databaseEvent('SAVE', 'Premio', true, `Prêmio "${premio}" cadastrado por ${dono}`);

            const embed = await new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle(' 🎁 Prêmio cadastrado com sucesso!')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(' O prêmio foi registrado com sucesso.')
                .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });

            logger.info(`Prêmio "${premio}" cadastrado com sucesso por ${dono}`, context);
        }
    } catch (error) {
        logger.error('Erro ao cadastrar o prêmio', context, error);
        databaseEvent('SAVE', 'Premio', false, `Erro: ${error.message}`);
    }
}

module.exports = { premioSorteio };