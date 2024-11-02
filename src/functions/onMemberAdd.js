const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { info, erro } = require('../logger');

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

    member.send(`Olá ${member.user.tag} bem-vindo(a) ao servidor Jonalandia! Leia as regras <#1253359463042384012> Pegue os cargos de acordo com seu gosto <#1253360042212855933>  `)
      .then(() => info.info(`Mensagem enviada ao membro ${member.user.tag}.`))
      .catch(error => info.info(`Erro ao enviar mensagem para o membro ${member.user.tag}:`, error))

    info.info(`${member.user} Acabou de entrar no servidor ${member.guild}`);
    
    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
    discordChannel.send(`${member.user} Acabou de entrar no servidor ${member.guild}.`)
    
 } else {
  erro.error('Canal de boas-vindas não encontrado. Certifique-se de configurar o ID do canal corretamente.');
 }
}

module.exports = { onMemberAdd };