const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { logger, botEvent, databaseEvent } = require('../logger');

function onMemberAdd(member) {
  const context = {
    module: 'MEMBER_EVENTS',
    user: member.user.tag,
    guild: member.guild?.name
  };

  logger.info(`Novo membro entrou no servidor: ${member.user.tag}`, context);
  botEvent('MEMBER_JOINED', `${member.user.tag} entrou no servidor`);

  const welcomeChannel = member.guild.channels.cache.get(process.env.CHANNEL_ID_BEMVINDO);

  if (welcomeChannel) {
    try {
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
      logger.debug('Embed de boas-vindas enviado no canal público', context);

      // Enviar DM para o novo membro
      member.send(`Olá ${member.user.tag} bem-vindo(a) ao servidor Jonalandia! Leia as regras <#1253359463042384012> Pegue os cargos de acordo com seu gosto <#1253360042212855933>  `)
        .then(() => {
          logger.debug(`DM de boas-vindas enviada para ${member.user.tag}`, context);
          botEvent('WELCOME_DM_SENT', `DM enviada para ${member.user.tag}`);
        })
        .catch(error => {
          logger.warn(`Erro ao enviar DM para ${member.user.tag}`, context, error);
          botEvent('WELCOME_DM_FAILED', `Falha ao enviar DM para ${member.user.tag}: ${error.message}`);
        });

      // Log no canal de logs
      const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      if (discordChannel) {
        try {
          discordChannel.send(`${member.user} Acabou de entrar no servidor ${member.guild}.`);
          logger.debug('Log de entrada enviado para canal de logs', context);
        } catch (logError) {
          logger.warn('Erro ao enviar log para canal', context, logError);
        }
      } else {
        logger.warn('Canal de logs não encontrado', context);
      }

    } catch (error) {
      logger.error('Erro ao processar entrada de membro', context, error);
      botEvent('MEMBER_JOIN_ERROR', `Erro ao processar entrada de ${member.user.tag}: ${error.message}`);
    }

  } else {
    logger.error('Canal de boas-vindas não encontrado - verifique configuração do CHANNEL_ID_BEMVINDO', context);
    botEvent('WELCOME_CHANNEL_NOT_FOUND', 'Canal de boas-vindas não encontrado');
  }
}

module.exports = { onMemberAdd };