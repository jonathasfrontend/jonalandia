const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { checkingComandChannelBlocked } = require("../utils/checkingComandsExecution");

async function menssageFile(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) return;

  if (commandName === 'oi') {
    const embed = await new EmbedBuilder()
      .setColor(0xffffff)
      .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`**Oi **${interaction.user}`);

    await interaction.reply({ embeds: [embed] });
    
  }
};

module.exports = { menssageFile };