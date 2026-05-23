const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/Transaction');
const ReconciliationRun = require('../models/ReconciliationRun');
const ReconciliationResult = require('../models/ReconciliationResult');
const { reconcile } = require('../services/reconciliationEngine');

exports.runReconciliation = async (req, res) => {
  try {
    const { runId, timestampToleranceSec, quantityTolerancePct } = req.body;

    if (!runId) return res.status(400).json({ error: 'runId is required' });

    const tsSec = parseFloat(timestampToleranceSec) || parseFloat(process.env.TIMESTAMP_TOLERANCE_SECONDS) || 300;
    const qtyPct = parseFloat(quantityTolerancePct) || parseFloat(process.env.QUANTITY_TOLERANCE_PCT) || 0.01;

    const [userTxs, exchangeTxs] = await Promise.all([
      Transaction.find({ runId, source: 'user' }).lean(),
      Transaction.find({ runId, source: 'exchange' }).lean(),
    ]);

    if (userTxs.length === 0 || exchangeTxs.length === 0) {
      return res.status(400).json({ error: 'No transactions found for this runId' });
    }

    const reconcileRunId = uuidv4();

    // Create run record
    const run = await ReconciliationRun.create({
      runId: reconcileRunId,
      status: 'pending',
      timestampToleranceSec: tsSec,
      quantityTolerancePct: qtyPct,
    });

    const { results, summary } = reconcile(userTxs, exchangeTxs, {
      timestampToleranceSec: tsSec,
      quantityTolerancePct: qtyPct,
    });

    // Store results
    const resultDocs = results.map((r) => ({ ...r, runId: reconcileRunId }));
    await ReconciliationResult.insertMany(resultDocs);

    // Update run
    await ReconciliationRun.findByIdAndUpdate(run._id, {
      status: 'completed',
      summary,
    });

    res.json({ reconcileRunId, summary });
  } catch (err) {
    console.error('Reconcile error:', err);
    res.status(500).json({ error: err.message });
  }
};
