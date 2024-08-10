const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { Player, useQueue } = require("discord-player");
const blockedChannels = require('../../config/blockedChannels')

const player = new Player(client);

const Resume = async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.member.voice.channel){
    const embed = await new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("Você precisa estar em um canal de voz para tocar uma música.❌")
    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  const queue = useQueue(interaction.guild);

  if (!queue.connection) await queue.connect(interaction.member.voice.channel);

  if (!queue) return interaction.editReply({ content: `Nenhuma música tocando❌`, ephemeral: true });
  if(queue.node.isPlaying()) return inter.editReply({content: `A pista já está funcionando,❌`, ephemeral: true})


  const { commandName, channelId } = interaction;
 
  if (commandName === 'resume') {

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

    const success = queue.node.resume();

    const embed = await new EmbedBuilder()
    .setColor(0xffffff)
    .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`Musica **${queue.currentTrack.title}** voltou a tocar! ✅`)
    .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
    .setTimestamp()
    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
    await interaction.reply({ embeds: [embed] });
  }
};

module.exports = { Resume };