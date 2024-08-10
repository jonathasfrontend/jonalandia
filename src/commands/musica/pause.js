const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { Player, useQueue } = require("discord-player");
const blockedChannels = require('../../config/blockedChannels')

const player = new Player(client);

const Pause = async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.member.voice.channel){
    const embed = await new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("Você precisa estar em um canal de voz para tocar uma música.❌")
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  const queue = useQueue(interaction.guild);

  if (!queue.connection) await queue.connect(interaction.member.voice.channel);

  if (!queue) return interaction.reply({ content: `Nenhuma música tocando ${interaction.member}❌`, ephemeral: true });
//   if(queue.node.isPaused()) return interaction.reply({content: `A faixa está pausada no momento, ${interaction.member}❌`, ephemeral: true})


  const { commandName, channelId } = interaction;
 
  if (commandName === 'pause') {
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

    const success = queue.node.setPaused(true);

    const embed = await new EmbedBuilder()
    .setColor(0xffffff)
    .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`Musica pausada **${queue.currentTrack.title}**! ✅`)
    .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
    .setTimestamp()
    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
    await interaction.reply({ embeds: [embed] });
  }
};

module.exports = { Pause };