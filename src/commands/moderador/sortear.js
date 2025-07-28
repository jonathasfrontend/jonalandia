const Sorteio = require('../../models/onSorteioSchema');
const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger, databaseEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function sortear(interaction) {
  if (!interaction.isCommand()) return;

  const context = {
    module: 'MODERATION',
    command: 'sortear',
    user: interaction.user.tag,
    guild: interaction.guild?.name
  };

  logger.debug('Iniciando comando sortear', context);

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) {
    logger.warn('Comando sortear bloqueado - canal não autorizado', context);
    return;
  }

  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) {
    logger.warn('Comando sortear negado - usuário sem permissão de moderador', context);
    return;
  }

  try {
    logger.debug('Buscando último prêmio cadastrado', context);
    const premio = await Premio.findOne().sort({ dataCadastro: -1 }).limit(1);

    if (!premio) {
      logger.warn('Tentativa de sorteio sem prêmios cadastrados', context);
      return interaction.reply('Não há prêmios cadastrados.');
    }

    logger.debug('Buscando participantes do sorteio', context);
    const participantes = await Sorteio.find();

    if (participantes.length === 0) {
      logger.warn('Tentativa de sorteio sem participantes', context);
      return interaction.reply('Não há participantes no sorteio.');
    }

    const vencedor = participantes[Math.floor(Math.random() * participantes.length)];

    logger.info(`Sorteio realizado - Vencedor: ${vencedor.nomeUsuario}, Prêmio: ${premio.premio}`, {
      ...context,
      winner: vencedor.nomeUsuario,
      prize: premio.premio,
      totalParticipants: participantes.length
    });

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
    sorteioChannel.send({ embeds: [embed] });

    await interaction.reply('Sorteio realizado com sucesso!', { ephemeral: true });

    databaseEvent('FIND', 'Premio/Sorteio', true, `Sorteio executado com ${participantes.length} participantes`);
  } catch (error) {
    logger.error('Erro ao realizar o sorteio', context, error);
    databaseEvent('FIND', 'Premio/Sorteio', false, `Erro: ${error.message}`);
  }
}

module.exports = { sortear };