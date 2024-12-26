const Sorteio = require('../../models/onSorteioSchema');
const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { erro, info } = require('../../Logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function limpaSorteio(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) return;
  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) return;

  try {
    if (commandName === 'limpasorteio') {
      await Sorteio.deleteMany({});
      await Premio.deleteMany({});

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
    }
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
    await logChannel.send(`Sorteio limpo com sucesso.`);

    info.info('Sorteio limpo com sucesso.');

  } catch (error) {
    erro.error('Erro ao limpar sorteio:', error);
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
    await logChannel.send(`Erro ao limpar sorteio: ${error}`);

  }
}

module.exports = { limpaSorteio };