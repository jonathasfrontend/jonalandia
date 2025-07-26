const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function mensageRegra(interaction) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'regra') {

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    const embed = await new EmbedBuilder()
      .setColor("White")
      .setTitle('📋 Regras')
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`
        **Ofensas**:
        Qualquer tipo de ataque verbal que seja considerado ofensivo pra vítima; Ataques direcionadas no privado de quaisquer membro do servidor; Proibido assédio ou qualquer outro tipo de importunação que venha a constranger algum membro, seja ele homem/mulher ou não binário.

        **Preconceito**:
        Qualquer tipo de discriminação contra qualquer etnia, sexualidade, condição física, religião, identidade de gênero, entre outros.

        **Conteúdo adulto**:
        É totalmente proibido qualquer tipo de compartilhamento de link ou imagens de conteúdo pornográfico, sendo conteúdo pessoal ou não.

        **Política e Religião**:
        Proibido qualquer conversa política ou de tema religioso. Devido essas conversas geralmente levarem para conflitos negativos.

        **Divulgação inadequada**:
        Existe uma sala específica para isso, então não adianta tentar divulgar em outro canal.

        **Exposição de membros**:
        É totalmente proibido a divulgação de dados pessoas de qualquer membro, seja eles endereço, telefone e afins, se a vítima denunciar você irá ser banido. Por questão de segurança, caso a vítima não esteja online no momento, tais informações serão apagadas e a vítima irá ser comunicada do ocorrido.

        **Estimular ou praticar atividades ilegais**:
        É totalmente proibido estimular ou praticar quaisquer atividades ilegais.

        **Divulgação em mensagens privadas dos membros do servidor**:
        Quer divulgar alguma coisa? Mande mensagem para algum moderador e sacie sua dúvida sobre isso, caso seja possível irá ser divulgado, não divulgue sem permissão.

        **Conteúdo GORE**:
        Qualquer imagem ou link com conteúdo forte que possa causar repulsos ou traumas nos membros do Discord.

        **Violação do TOS do Discord**:
        Qualquer violação das regras do próprio Discord, para saber quais são**: https://discord.com/terms.

        **Spoilers**:
        Qualquer spoiler de qualquer filme ou série deverá ser mandado no ⁠Desconhecido, qualquer outra sala é sujeito de banimento.
      `)
      .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
      .setImage('https://i.pinimg.com/originals/aa/b4/41/aab441520f83dbb4cbdaa6a61a9d76b4.jpg')
      .setTimestamp()
      .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

    await interaction.reply({ embeds: [embed] });
  }
};

module.exports = { mensageRegra };