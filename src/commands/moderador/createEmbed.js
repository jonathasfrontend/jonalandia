const { EmbedBuilder } = require('discord.js');
const { info, erro } = require('../../Logger');
const { client } = require('../../Client');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function createEmbed(interaction) {
  if (!interaction.isCommand()) return;
  
  const { commandName, options, member, channelId } = interaction;
  if (commandName === 'embed') {

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

      info.info(`Embed enviado com sucesso para o canal ${canal}!`);
    } catch (error) {
      erro.error('Erro ao enviar embed:', error);
      await interaction.reply({ content: 'Ocorreu um erro ao enviar o embed.', ephemeral: true });
    }

  }
};

module.exports = { createEmbed };
