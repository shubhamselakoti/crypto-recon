const { v4: uuidv4 } = require('uuid');
const { parseCSV } = require('../utils/csvParser');
const Transaction = require('../models/Transaction');
const IngestionError = require('../models/IngestionError');

exports.uploadCSVs = async (req, res) => {
  try {
    if (!req.files || !req.files.user_file || !req.files.exchange_file) {
      return res.status(400).json({ error: 'Both user_file and exchange_file are required' });
    }

    const runId = uuidv4();
    const userFile = req.files.user_file[0];
    const exchangeFile = req.files.exchange_file[0];

    // Parse both files
    const [userParsed, exchangeParsed] = await Promise.all([
      parseCSV(userFile.path),
      parseCSV(exchangeFile.path),
    ]);

    // Clear previous transactions for this source if re-uploading
    // Store all valid transactions
    const userDocs = userParsed.valid.map((tx) => ({ ...tx, source: 'user', runId }));
    const exchangeDocs = exchangeParsed.valid.map((tx) => ({ ...tx, source: 'exchange', runId }));

    await Transaction.insertMany([...userDocs, ...exchangeDocs]);

    // Store ingestion errors
    const errorDocs = [
      ...userParsed.invalid.map((e) => ({ ...e, source: 'user', runId })),
      ...exchangeParsed.invalid.map((e) => ({ ...e, source: 'exchange', runId })),
    ];
    if (errorDocs.length > 0) await IngestionError.insertMany(errorDocs);

    res.json({
      runId,
      userFile: userFile.originalname,
      exchangeFile: exchangeFile.originalname,
      userTransactions: userParsed.valid.length,
      exchangeTransactions: exchangeParsed.valid.length,
      ingestionErrors: errorDocs.length,
      errors: errorDocs,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};
