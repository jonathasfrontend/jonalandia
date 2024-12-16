const { EmbedBuilder } = require('discord.js');
const Stripe = require('stripe');
const User = require('../models/rankingUserSechema');
const TransactionVenda = require('../models/transactionVendaSchema');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { gemPrices } = require('../webhooks/gemOptions');

async function vendeGema(interaction) {
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
  }
  
  module.exports = { vendeGema };
  