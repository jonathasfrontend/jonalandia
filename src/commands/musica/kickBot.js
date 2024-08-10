const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { useQueue } = require("discord-player");
const blockedChannels = require('../../config/blockedChannels')

const Kickbot = async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.member.voice.channel){
    const embed = new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("Você precisa estar em um canal de voz para tocar uma música.❌")
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  const queue = useQueue(interaction.guild);


  const { commandName, channelId } = interaction;
 
  if (commandName === 'kick') {
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
   

    if (queue.connection) await queue.connection.disconnect();

    const embed = await new EmbedBuilder()
    .setColor(0xffffff)
    .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`Bot removido da call ✅`)
    .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
    .setTimestamp()
    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
    await interaction.reply({ embeds: [embed] });
  }
};

module.exports = { Kickbot };