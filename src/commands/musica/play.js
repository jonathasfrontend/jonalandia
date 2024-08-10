const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { QueryType, Player } = require("discord-player");
const blockedChannels = require('../../config/blockedChannels')

const player = new Player(client);

const Play = async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.member.voice.channel){
  const embed = new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("Você precisa estar em um canal de voz para tocar uma música.❌")
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

const { commandName, options, channelId } = interaction;

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

  const queue = await player.nodes.create(interaction.guild, {
    metadata: interaction.channel,
    spotifyBridge: client.config.opt.spotifyBridge,
    volume: client.config.opt.volume,
    leaveOnEmpty: client.config.opt.leaveOnEmpty,
    leaveOnEmptyCooldown: client.config.opt.leaveOnEmptyCooldown,
    leaveOnEnd: client.config.opt.leaveOnEnd,
    leaveOnEndCooldown: client.config.opt.leaveOnEndCooldown,
  })
  if (!queue.connection) await queue.connect(interaction.member.voice.channel)
 
  if (commandName === 'play') {
    if (options.getString('url')) {
      const url = options.getString('url');

      const serachVideoUrl = await player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO
      })

      if (serachVideoUrl.tracks.length ===  0) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("Erro ao encontrar o vídeo!❌");
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
      
      const song = serachVideoUrl.tracks[0];
      await queue.addTrack(song);

      const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Tocando: **${song.title}**, Para: ${interaction.user}✅`)
        // .setDescription(`${song.url}`)
        .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
        .setImage(`${song.thumbnail}`)
        .setTimestamp()
        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
        await interaction.reply({ embeds: [embed] });

      }
      if (!queue.isPlaying()) await queue.node.play();
  }
};

module.exports = { Play };