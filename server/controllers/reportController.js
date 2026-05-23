const ReconciliationRun = require('../models/ReconciliationRun');
const ReconciliationResult = require('../models/ReconciliationResult');

exports.getFullReport = async (req, res) => {
  try {
    const { runId } = req.params;
    const { page = 1, limit = 20, category, search } = req.query;

    const run = await ReconciliationRun.findOne({ runId });
    if (!run) return res.status(404).json({ error: 'Run not found' });

    const filter = { runId };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { asset: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') },
        { reason: new RegExp(search, 'i') },
      ];
    }

    const total = await ReconciliationResult.countDocuments(filter);
    const results = await ReconciliationResult.find(filter)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    res.json({
      run,
      results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { runId } = req.params;
    const run = await ReconciliationRun.findOne({ runId });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json({ runId, summary: run.summary, createdAt: run.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnmatched = async (req, res) => {
  try {
    const { runId } = req.params;
    const results = await ReconciliationResult.find({
      runId,
      category: { $in: ['unmatched_user', 'unmatched_exchange'] },
    }).lean();
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllRuns = async (req, res) => {
  try {
    const runs = await ReconciliationRun.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ runs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
