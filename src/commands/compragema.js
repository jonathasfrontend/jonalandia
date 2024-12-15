const { EmbedBuilder } = require('discord.js');
const Stripe = require('stripe');
const User = require('../models/rankingUserSechema');
const Transaction = require('../models/transactionSchema');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Configure no .env
const { gemOptions } = require('../webhooks/gemOptions');

async function compraGema(interaction) {
  const { commandName, options, user } = interaction;

  if (commandName !== 'compragema') return;

  const amount = options.getInteger('quantidade');

  const gemOption = gemOptions.find(opt => opt.amount === amount);
  if (!gemOption) {
    return interaction.reply({
      content: 'Quantidade inválida. Escolha uma quantidade válida de gemas.',
      ephemeral: true,
    });
  }

  // Criar uma sessão de pagamento com Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Olá ${user.username}, você está comprando ${gemOption.amount} gemas por R$${gemOption.price} 🎉`,
          },
          unit_amount: gemOption.price * 100, // em centavos
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CANCEL_URL}`,
    metadata: { userId: user.id, username: user.username, gemAmount: gemOption.amount },
  });

  // Registrar transação no banco de dados
  const transaction = new Transaction({
    userId: user.id,
    username: user.username,
    gemAmount: gemOption.amount,
    price: gemOption.price,
    stripeSessionId: session.id,
  });

  await transaction.save();

  const embed = new EmbedBuilder()
    .setColor('Blue')
    .setTitle('Compra de Gemas')
    .setDescription(
      `Você está comprando **${gemOption.amount} gemas** por R$${gemOption.price}.\n\nClique no link abaixo para finalizar a compra:\n[Pagamento Seguro](<${session.url}>)`
    )
    .setFooter({ text: 'Pagamento via Stripe' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { compraGema };
