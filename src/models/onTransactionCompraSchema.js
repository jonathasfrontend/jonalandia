const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  gemAmount: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // pending, completed, failed
  stripeSessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('onTransactionCompraSchema', transactionSchema);
