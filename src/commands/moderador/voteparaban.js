const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Vote = require('../../models/onVotoBanUserSchema ');
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function voteParaBan(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName, member, channelId, options } = interaction;

  if (blockedChannels.includes(channelId)) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("Este comando não pode ser usado neste canal")
      .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (!member.roles.cache.has(process.env.CARGO_MODERADOR)) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription('Você não tem permissão para usar este comando.')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  try {
    if (commandName === 'voteparaban') {
      const targetUser = options.getUser('usuario');
      const endTime = new Date(Date.now() + 5 * 60 * 1000); // Votação dura 5 minutos

      // Salvar a votação no banco de dados
      const newVote = await Vote.create({
        targetUserId: targetUser.id,
        targetUsername: targetUser.username,
        targetAvatarUrl: targetUser.displayAvatarURL({ dynamic: true }),
        startedBy: interaction.user.id,
        endTime,
      });

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

      client.on('interactionCreate', async (buttonInteraction) => {
        if (!buttonInteraction.isButton()) return;
        const votoButtonId = buttonInteraction.customId;
        if (votoButtonId.startsWith('sim') || votoButtonId.startsWith('nao')) {
          const voteId = votoButtonId.slice(3);
          const vote = await Vote.findById(voteId);
          if (!vote) return;

          if (vote.votes.some(v => v.userId === buttonInteraction.user.id)) {
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

        try {
          await interaction.editReply({ embeds: [endedEmbed], components: [] });

          const reason = `O O usuário foi banido por votação. Sim: ${yesVotes} Não: ${noVotes}`;
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

          const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
          await logChannel.send(`Votação encerrada para ${targetUser.tag}.`);

          info.info(`Votação encerrada para ${targetUser.tag}.`);
        } catch (err) {
          erro.error('Erro ao encerrar a votação:', err);
        }
      }, 5 * 60 * 1000);

      const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      await logChannel.send(`Votação para banir ${targetUser.tag} iniciada por ${interaction.user.tag}`);

      info.info(`Votação para banir ${targetUser.tag} iniciada por ${interaction.user.tag}`);
    }
  } catch (error) {
    erro.error('Erro ao iniciar votação para ban:', error);
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
    await logChannel.send(`Erro ao iniciar votação para ban: ${error}`);
  }
}

module.exports = { voteParaBan };