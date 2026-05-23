const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['user', 'exchange'], required: true },
    txId: { type: String, required: true },
    asset: { type: String },
    type: { type: String },
    quantity: { type: Number },
    priceUsd: { type: Number },
    fee: { type: Number },
    timestamp: { type: Date },
    rawData: { type: mongoose.Schema.Types.Mixed },
    runId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
