const { EmbedBuilder } = require('discord.js');
const User = require('../models/rankingUserSechema');
const { client } = require("../Client");
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;
const { erro, info } = require('../Logger');

async function Recompensas(interaction) {
  const { user, commandName, channelId } = interaction;

  if (!interaction.isCommand()) return;

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

  try {
    if (commandName === 'recompensa') {

      const userId = user.id;

      let userData = await User.findOne({ userId });

      if (!userData) {
        userData = new User({
          userId,
          username: user.username,
          coins: 0,
          dailyRewardTimestamp: null,
        });
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextMidnight = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const lastClaim = userData.dailyRewardTimestamp;

      if (lastClaim && lastClaim >= today) {
        const nextClaimTime = nextMidnight.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
        return interaction.reply({
          content: `Você já resgatou recompensas diárias hoje! Aguarde até ${nextMidnight.toLocaleDateString('pt-BR')} às ${nextClaimTime} para resgatar novamente.`,
          ephemeral: true
        });
      }

      const reward = Math.floor(Math.random() * (3500 - 1800 + 1)) + 1800;

      userData.coins += reward;
      userData.dailyRewardTimestamp = now;
      await userData.save();

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🎉 Recompensa Diária Resgatada!')
        .setDescription(`Você recebeu ${reward.toLocaleString('pt-BR')} moedas como recompensa diária!`)
        .addFields(
          { name: '💰 Seu saldo atual', value: `${userData.coins.toLocaleString('pt-BR')} moedas`, inline: true },
        )
        .setFooter({ text: 'Volte amanhã para resgatar novamente!', iconURL: client.user.displayAvatarURL({ dynamic: true }) });
      await interaction.reply({ embeds: [embed] });

      const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      await logChannel.send(`Usuário ${user.username} resgatou recompensa diária de ${reward.toLocaleString('pt-BR')} moedas.`);
      info.info(`Usuário ${user.username} resgatou recompensa diária de ${reward.toLocaleString('pt-BR')} moedas.`);
    }
  } catch (error) {
    erro.error('Erro ao resgatar recompensa', error);
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
    await logChannel.send(`Erro ao resgatar recompensa ${error.message}`);
  }
}

module.exports = { Recompensas };