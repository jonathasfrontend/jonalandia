const Sorteio = require('../../models/onSorteioSchema');
const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger, databaseEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function limpaSorteio(interaction) {
  if (!interaction.isCommand()) return;

  const context = {
    module: 'MODERATION',
    command: 'limpasorteio',
    user: interaction.user.tag,
    guild: interaction.guild?.name
  };

  logger.debug('Iniciando comando limpasorteio', context);

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) {
    logger.warn('Comando limpasorteio bloqueado - canal não autorizado', context);
    return;
  }

  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) {
    logger.warn('Comando limpasorteio negado - usuário sem permissão de moderador', context);
    return;
  }

  try {
    logger.debug('Iniciando limpeza dos sorteios e prêmios', context);

    await Sorteio.deleteMany({});
    await Premio.deleteMany({});

    databaseEvent('DELETE_MANY', 'Sorteio', true, 'Todos os sorteios removidos');
    databaseEvent('DELETE_MANY', 'Premio', true, 'Todos os prêmios removidos');

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle(' 🎁 Sorteio limpo com sucesso!')
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription('🎁 Sorteio limpo com sucesso!')
      .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
      .setTimestamp()
      .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });

    logger.info('Sorteio limpo com sucesso', context);

  } catch (error) {
    logger.error('Erro ao limpar sorteio', context, error);
    databaseEvent('DELETE_MANY', 'Sorteio/Premio', false, `Erro: ${error.message}`);
  }
}

module.exports = { limpaSorteio };