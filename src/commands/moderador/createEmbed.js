const { EmbedBuilder } = require('discord.js');
const { logger, commandExecuted } = require('../../logger');
const { client } = require('../../Client');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function createEmbed(interaction) {
  if (!interaction.isCommand()) return;

  const { options } = interaction;

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) return;

  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) return;

  const titulo = options.getString('titulo');
  const descricao = options.getString('descricao');
  const canal = options.getChannel('canal');
  const cor = options.getString('cor');

  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descricao)
    .setColor(cor)
    .setTimestamp();

  try {
    await canal.send({ embeds: [embed] });
    await interaction.reply({ content: `Embed enviado com sucesso para o canal ${canal}!`, ephemeral: true });

    const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
    discordChannel2.send(`Embed enviado usuario com sucesso para o canal ${canal}!`);

    commandExecuted('CREATE_EMBED', `Embed enviado com sucesso para o canal ${canal}`);
    logger.info(`Embed enviado com sucesso para o canal ${canal}`, { module: 'CREATE_EMBED' });
  } catch (error) {
    logger.error('Erro ao enviar embed:', error);
    await interaction.reply({ content: 'Ocorreu um erro ao enviar o embed.', ephemeral: true });
  }
};

module.exports = { createEmbed };
