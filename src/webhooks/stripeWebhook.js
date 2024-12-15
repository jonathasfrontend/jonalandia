const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/rankingUserSechema');
const Transaction = require('../models/transactionSchema');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const transaction = await Transaction.findOne({ stripeSessionId: session.id });
    if (transaction && transaction.status === 'pending') {
      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findOne({ userId: transaction.userId });
      if (user) {
        user.gems += transaction.gemAmount;
        await user.save();
      } else {
        await User.create({
          userId: transaction.userId,
          username: transaction.username,
          gems: transaction.gemAmount,
        });
      }
    }
  }

  res.status(200).send('Event received');
});

module.exports = app;
