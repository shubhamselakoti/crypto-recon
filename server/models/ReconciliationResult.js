const mongoose = require('mongoose');

const reconciliationResultSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['matched', 'conflicting', 'unmatched_user', 'unmatched_exchange'],
      required: true,
    },
    reason: { type: String },
    userTransaction: { type: mongoose.Schema.Types.Mixed },
    exchangeTransaction: { type: mongoose.Schema.Types.Mixed },
    quantityDiff: { type: Number },
    timestampDiffSec: { type: Number },
    asset: { type: String },
    type: { type: String },
    quantity: { type: Number },
    timestamp: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReconciliationResult', reconciliationResultSchema);
