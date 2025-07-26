const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Vote = require('../../models/onVotoBanUserSchema ');
const { client } = require("../../Client");
const { logger, commandExecuted, securityEvent, databaseEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function voteParaBan(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const context = {
    module: 'MODERATION',
    command: 'voteparaban',
    user: interaction.user.tag,
    guild: interaction.guild?.name
  };

  logger.debug('Iniciando comando voteparaban', context);

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) {
    logger.warn('Comando voteparaban bloqueado - canal não autorizado', context);
    return;
  }
  
  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) {
    logger.warn('Comando voteparaban negado - usuário sem permissão de moderador', context);
    return;
  }

  try {
    if (commandName === 'voteparaban') {
      const targetUser = options.getUser('usuario');
      const endTime = new Date(Date.now() + 5 * 60 * 1000);

      logger.info(`Iniciando votação para banir usuário: ${targetUser.tag}`, {
        ...context,
        targetUser: targetUser.tag
      });

      const newVote = await Vote.create({
        targetUserId: targetUser.id,
        targetUsername: targetUser.username,
        targetAvatarUrl: targetUser.displayAvatarURL({ dynamic: true }),
        startedBy: interaction.user.id,
        endTime,
      });

      databaseEvent('CREATE', 'Vote', true, `Votação criada para banir ${targetUser.tag}`);

      const btnSim = new ButtonBuilder()
        .setCustomId(`sim${newVote.id}`)
        .setLabel('Sim')
        .setStyle(ButtonStyle.Success)

      const btnNao = new ButtonBuilder()
        .setCustomId(`nao${newVote.id}`)
        .setLabel('Não')
        .setStyle(ButtonStyle.Danger)

      const row = new ActionRowBuilder()
        .addComponents(btnSim, btnNao);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle('Votação para Ban')
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`Votação iniciada para banir **${targetUser.tag}**. Clique no botão para votar.`)
        .setThumbnail(`${targetUser.displayAvatarURL({ dynamic: true })}`)
        .addFields(
          { name: 'Iniciado por', value: interaction.user.tag, inline: true },
          { name: 'Expira em', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

      await interaction.reply({ embeds: [embed], components: [row] });

      securityEvent('VOTE_BAN_INITIATED', targetUser, interaction.guild, `Votação iniciada por ${interaction.user.tag}`);

      client.on('interactionCreate', async (buttonInteraction) => {
        if (!buttonInteraction.isButton()) return;

        const votoButtonId = buttonInteraction.customId;

        if (votoButtonId.startsWith('sim') || votoButtonId.startsWith('nao')) {
          const voteContext = {
            module: 'MODERATION',
            command: 'vote_interaction',
            user: buttonInteraction.user.tag,
            guild: buttonInteraction.guild?.name
          };
          
          const voteId = votoButtonId.slice(3);
          const vote = await Vote.findById(voteId);
          if (!vote) return;

          if (vote.votes.some(v => v.userId === buttonInteraction.user.id)) {
            logger.warn(`Tentativa de voto duplicado por ${buttonInteraction.user.tag}`, voteContext);
            
            const embed = new EmbedBuilder()
              .setColor("#ff0000")
              .setTitle('Você já votou')
              .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              })
              .setDescription('Você já votou nesta votação.')
              .setThumbnail(`${targetUser.displayAvatarURL({ dynamic: true })}`)

            await buttonInteraction.reply({ embeds: [embed], ephemeral: true });
            return;
          }

          const voto = votoButtonId.startsWith('sim') ? 'sim' : 'nao';
          vote.votes.push({
            userId: buttonInteraction.user.id,
            username: buttonInteraction.user.username,
            vote: voto,
          });
          await vote.save();

          logger.debug(`Voto registrado: ${voto} por ${buttonInteraction.user.tag}`, voteContext);

          const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle(`Seu voto é: ${voto} para banir`)
            .setAuthor({
              name: client.user.username,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Você votou **${voto}** na votação para banir **${targetUser.tag}**.`)
            .setThumbnail(`${targetUser.displayAvatarURL({ dynamic: true })}`)

          await buttonInteraction.reply({ embeds: [embed], ephemeral: true });
        }
      });

      setTimeout(async () => {
        try {
          const yesVotes = await Vote.countDocuments({ _id: newVote.id, 'votes.vote': 'sim' });
          const noVotes = await Vote.countDocuments({ _id: newVote.id, 'votes.vote': 'nao' });

          const endedEmbed = EmbedBuilder.from(embed)
            .setTitle('Votação Encerrada')
            .setDescription(`Votação encerrada para **${targetUser.tag}**.`)
            .setFields(
              {
                name: 'Contabilidade dos votos',
                value: `
                  Sim: ${yesVotes}
                  Não: ${noVotes}
                `
              }
            );

          await interaction.editReply({ embeds: [endedEmbed], components: [] });

          const reason = `O usuário foi banido por votação. Sim: ${yesVotes} Não: ${noVotes}`;
          const type = 'bans';

          saveUserInfractions(
            targetUser.id,
            targetUser.tag,
            targetUser.displayAvatarURL({ dynamic: true }),
            targetUser.createdAt,
            targetUser.joinedAt,
            type,
            reason,
            interaction.user.tag
          )

          await newVote.deleteOne();
          databaseEvent('DELETE', 'Vote', true, `Votação finalizada para ${targetUser.tag}`);

          logger.info(`Votação encerrada para ${targetUser.tag} - Sim: ${yesVotes}, Não: ${noVotes}`, {
            ...context,
            targetUser: targetUser.tag,
            yesVotes,
            noVotes
          });

          securityEvent('VOTE_BAN_COMPLETED', targetUser, interaction.guild, `Votação finalizada - Sim: ${yesVotes}, Não: ${noVotes}`);
          commandExecuted('voteparaban', interaction.user, interaction.guild, true);

        } catch (err) {
          logger.error('Erro ao encerrar a votação', context, err);
        }
      }, 5 * 60 * 1000);

      logger.info(`Votação para banir ${targetUser.tag} iniciada com sucesso`, {
        ...context,
        targetUser: targetUser.tag
      });
    }
  } catch (error) {
    logger.error('Erro ao iniciar votação para ban', context, error);
    commandExecuted('voteparaban', interaction.user, interaction.guild, false);
  }
}

module.exports = { voteParaBan };