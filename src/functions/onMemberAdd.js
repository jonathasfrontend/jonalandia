const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const logger = require('../logger');

function onMemberAdd(member) {
 const welcomeChannel = member.guild.channels.cache.get(process.env.CHANNEL_ID_BEMVINDO);
 if (welcomeChannel) {

    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTitle(`${member.user.tag} | Bem-vindo(a)!`)
      .setDescription(`Salve ${member.user}! Você acabou de entrar no 
                       servidor do ${member.guild}, aqui você poderá se 
                       interagir com fãs do ${member.guild}, conversar 
                       sobre suas coisas favoritas e muito mais!`)
      .addFields(
        { name: '📢 Fique atento!', value: `Os vídeos de canais serão anunciados <#${process.env.CHANNEL_ID_NOTIFICATION_TWITCH}> & <#${process.env.CHANNEL_ID_NOTIFICATION_YOUTUBE}>` },
      )
      .setImage('https://media.giphy.com/media/GPQBFuG4ABACA/source.gif')
      .setFooter({ text: `Por: ${client.user.username}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

    welcomeChannel.send({ embeds: [embed] });
    
 } else {
  logger.info('Canal de boas-vindas não encontrado. Certifique-se de configurar o ID do canal corretamente.');
 }
}

module.exports = { onMemberAdd };