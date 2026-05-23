const mongoose = require('mongoose');

const reconciliationRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    timestampToleranceSec: { type: Number, default: 300 },
    quantityTolerancePct: { type: Number, default: 0.01 },
    summary: {
      matched: { type: Number, default: 0 },
      conflicting: { type: Number, default: 0 },
      unmatchedUser: { type: Number, default: 0 },
      unmatchedExchange: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
    },
    userFileOriginal: { type: String },
    exchangeFileOriginal: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReconciliationRun', reconciliationRunSchema);
