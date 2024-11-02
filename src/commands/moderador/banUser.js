const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { client } = require('../../Client');
const { erro } = require('../../logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const banUser = async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, options } = interaction;

  if (commandName === 'banir') {
    const userToBan = options.getUser('usuario');

    
    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1254199140796207165> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!member.roles.cache.has(process.env.CARGO_MODERADOR)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription('Você não tem permissão para usar este comando.')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'Você não tem permissão para banir usuários.', ephemeral: true });
    }

    if (userToBan) {
      try {
        const memberToBan = await interaction.guild.members.fetch(userToBan.id);

        // Envia uma mensagem ao usuário banido antes do banimento
        await userToBan.send("Você foi banido do servidor por atitudes que contrariam as regras do servidor.");

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel2.send(`O usuário ${user.tag} foi banido por ${interaction.user.tag}.`);

        // Realiza o banimento
        await memberToBan.ban({ reason: "Para duvidas fale com o dono do servidor." });

        // Confirma o banimento no canal
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Usuário Banido')
          .setDescription(`O usuário ${userToBan.tag} foi banido com sucesso.`)
          .setTimestamp()
          .setFooter({ text: `Ação realizada por ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        erro.error(error);
        await interaction.reply({ content: 'Ocorreu um erro ao tentar banir o usuário.', ephemeral: true });
      }
    } else {
      await interaction.reply({ content: 'Usuário inválido ou não encontrado.', ephemeral: true });
    }
  }
};

module.exports = { banUser };
