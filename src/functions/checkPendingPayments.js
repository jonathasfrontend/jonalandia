const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/onTransactionCompraSchema');
const User = require('../models/onPerfilUserSechema');
const cron = require('node-cron');
const { client } = require("../Client");
const { EmbedBuilder } = require('discord.js');

async function verificarPagamentosPendentes() {
  try {
    // Busca todas as transações pendentes no banco de dados
    const transacoesPendentes = await Transaction.find({ status: 'pending' });

    for (const transacao of transacoesPendentes) {
      // Recupera informações da sessão de pagamento no Stripe
      const session = await stripe.checkout.sessions.retrieve(transacao.stripeSessionId);

      // Verifica se a sessão foi paga
      if (session.payment_status === 'paid') {
        // Atualiza o status da transação para 'completed'
        transacao.status = 'completed';
        await transacao.save();

        // Adiciona as gemas ao usuário
        const user = await User.findOne({ userId: transacao.userId });
        if (user) {
          user.gems += transacao.gemAmount;
          await user.save();
        } else {
          await User.create({
            userId: transacao.userId,
            username: transacao.username,
            gems: transacao.gemAmount,
          });
        }

        console.log(`Pagamento confirmado para a transação ${transacao._id}.`);

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('Pagamento Confirmado')
          .setDescription(`O pagamento da transação ${transacao.username} foi confirmado com sucesso!`)
          .setFooter({ text: 'Pagamento via Stripe' });

        const channalPayment = await client.channels.fetch(process.env.CHANNEL_ID_PAYMENTS);
        channalPayment.send({ embeds: [embed] });

      }
    }
  } catch (error) {
    console.error('Erro ao verificar pagamentos:', error.message);
  }
}

function scheduleVerificarPagamentosPendentes() {
  cron.schedule('*/2 * * * *', () => { 
    verificarPagamentosPendentes();
  });
}

module.exports = { scheduleVerificarPagamentosPendentes };