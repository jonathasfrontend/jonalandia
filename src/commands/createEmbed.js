const { EmbedBuilder } = require('discord.js');
const { info, erro } = require('../logger');
const { client } = require('../Client');

const createEmbed = async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, options, member } = interaction;
  if (commandName === 'embed') {

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

    const titulo = interaction.options.getString('titulo');
    const descricao = interaction.options.getString('descricao');
    const canal = interaction.options.getChannel('canal');
    const cor = interaction.options.getString('cor');

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descricao)
      .setColor(cor)
      .setTimestamp();

    try {
      await canal.send({ embeds: [embed] });
      await interaction.reply({ content: `Embed enviado com sucesso para o canal ${canal}!`, ephemeral: true });
      info.info(`Embed enviado com sucesso para o canal ${canal}!`);
    } catch (error) {
      erro.error('Erro ao enviar embed:', error);
      await interaction.reply({ content: 'Ocorreu um erro ao enviar o embed.', ephemeral: true });
    }

  }
};

module.exports = { createEmbed };
