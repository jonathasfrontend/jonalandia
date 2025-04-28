const Sorteio = require('../../models/onSorteioSchema');
const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function sortear(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) return;
  
  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) return;

  try {
    if (commandName === 'sortear') {
      const premio = await Premio.findOne().sort({ dataCadastro: -1 }).limit(1); // Pega o último prêmio
      if (!premio) return interaction.reply('Não há prêmios cadastrados.');

      const participantes = await Sorteio.find();
      if (participantes.length === 0) return interaction.reply('Não há participantes no sorteio.');

      const vencedor = participantes[Math.floor(Math.random() * participantes.length)];

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle(`Parabéns @${vencedor.nomeUsuario}!`)
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`Olá ${vencedor.nomeUsuario} você ganhou o prêmio: ${premio.premio} por ${premio.dono}`)
        .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
        .setTimestamp()
        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

      const sorteioChannel = client.channels.cache.get(process.env.CHANNEL_ID_SORTEIOS);
      sorteioChannel.send({ embeds: [embed] }); // Usando send ao invés de reply

      await interaction.reply('Sorteio realizado com sucesso!', { ephemeral: true });

      const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      await logChannel.send(`Sorteio realizado com sucesso.`);

      info.info('Sorteio realizado com sucesso.');
    }
  } catch (error) {
    erro.error('Erro ao realizar o sorteio', error);
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
    await logChannel.send(`Erro ao realizar o sorteio ${error}`);
  }
}

module.exports = { sortear };