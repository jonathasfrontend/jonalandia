const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { info, erro } = require('../Logger');

function onMemberRemove(member) {
    const discordChannel = member.guild.channels.cache.get(process.env.CHANNEL_ID_ATE_LOGO);
    
    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTitle('😭 ahhhhh!')
      .setDescription(`⚰ **${member.user}** saiu do servidor...`)
      .setImage('https://i.pinimg.com/originals/81/2d/e9/812de920c0c7076356699d644418e326.gif')
      .setFooter({ text: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

    discordChannel.send({ embeds: [embed] });

    const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
    discordChannel2.send(`${member.user} Acabou de sair no servidor ${member.guild}.`)

    member.user.send({ embeds: [embed] }).catch(error => {
      if (error.code === 50007) {
        info.info('Não foi possível enviar a mensagem direta para o usuário. O usuário pode ter desativado mensagens diretas ou bloqueado o bot.');
        
      } else {
        erro.error('Ocorreu um erro ao tentar enviar a mensagem direta para o usuário');
      }
  });
}

module.exports = { onMemberRemove };
