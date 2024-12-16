const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
  gemAmount: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['purchase', 'sale'], required: true }, // 'purchase' or 'sale'
  stripeSessionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('transactionvenda', transactionSchema);
