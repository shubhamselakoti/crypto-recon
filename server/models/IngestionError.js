const mongoose = require('mongoose');

const ingestionErrorSchema = new mongoose.Schema(
  {
    runId: { type: String },
    source: { type: String },
    rowNumber: { type: Number },
    reason: { type: String },
    rawData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IngestionError', ingestionErrorSchema);
