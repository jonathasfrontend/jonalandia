const { client } = require("../Client");
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;
const { erro, info } = require('../Logger');
const Stripe = require('stripe');
const User = require('../models/rankingUserSechema');
const TransactionVenda = require('../models/transactionVendaSchema');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { gemPrices } = require('../webhooks/gemOptions');

async function vendeGema(interaction) {
  const { commandName, channelId } = interaction;

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
    if (commandName === 'vendegema') {

      const quantidade = interaction.options.getInteger('quantidade');
      const user = await User.findOne({ username: interaction.user.username });

      if (!user || user.gems <= 0) {
        return interaction.reply({ content: 'Saldo de gemas insuficiente.', ephemeral: true });
      }

      const gemOption = gemPrices.find(opt => opt.amount === quantidade);
      if (!gemOption) {
        return interaction.reply({ content: 'Quantidade inválida.', ephemeral: true });
      }

      const valorVenda = gemOption.price;
      user.gems -= quantidade;
      await user.save();

      const transactionVenda = new TransactionVenda({
        discordId: interaction.user.id,
        username: interaction.user.username,
        gemAmount: quantidade,
        price: valorVenda,
        type: 'sale',
        status: 'completed',
      });
      await transactionVenda.save();

      await stripe.transfers.create({
        amount: valorVenda * 100,
        currency: 'brl',
        destination: process.env.STRIPE_PUBLIC_KEY,
      });

      interaction.reply({ content: `Você vendeu ${quantidade} gemas por R$${valorVenda}.`, ephemeral: true });

      const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      await logChannel.send(`Usuário ${interaction.user.username} vendeu ${quantidade} gemas por R$${valorVenda}.`);
      info.info(`Usuário ${interaction.user.username} vendeu ${quantidade} gemas por R$${valorVenda}.`);
    }
  } catch (error) {
    erro.error('Erro ao vender gema', error);
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
    await logChannel.send(`Erro ao vender gema ${error.message}`);
  }
}

module.exports = { vendeGema };
