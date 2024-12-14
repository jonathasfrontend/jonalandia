const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { saveUpdateUserPoints } = require("../utils/saveUpdateUserPoints");
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function menssageFile(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName, channelId } = interaction;

  if (commandName === 'oi') {
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

    const embed = await new EmbedBuilder()
      .setColor(0xffffff)
      .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`**Oi **${interaction.user}`);

    await interaction.reply({ embeds: [embed] });

    saveUpdateUserPoints(interaction.user, 300, 500, 10);
    
  }
};

module.exports = { menssageFile };