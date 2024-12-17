const { EmbedBuilder } = require('discord.js');
const Stripe = require('stripe');
const TransactionCompra = require('../models/onTransactionCompraSchema');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { client } = require("../Client");
const { gemOptions } = require('../webhooks/gemOptions');
const { info, erro } = require('../Logger');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function compraGema(interaction) {
  const { commandName, options, user, channelId } = interaction;

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
    if (commandName === 'compragema') {

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
      const transactionCompra = new TransactionCompra({
        userId: user.id,
        username: user.username,
        gemAmount: gemOption.amount,
        price: gemOption.price,
        stripeSessionId: session.id,
      });
      await transactionCompra.save();

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Compra de Gemas')
        .setDescription(
          `Você está comprando **${gemOption.amount} gemas** por R$${gemOption.price}.
Clique no link abaixo para finalizar a compra:
[Pagamento Seguro](<${session.url}>)
**O deposito será efetuado 2 min apos o pagamento!**
`
        )
        .setFooter({ text: 'Pagamento via Stripe' });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      await logChannel.send(`Compra de gemas iniciada por ${user.username}`);
      info.info(`Compra de gemas iniciada por ${user.username}`);
    }
  } catch (error) {
    erro.error('Erro ao comprar gema', error);
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
    await logChannel.send(`Erro ao comprar gema ${error.message}`);
  }
}

module.exports = { compraGema };
