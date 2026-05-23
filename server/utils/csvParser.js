const fs = require('fs');
const csvParser = require('csv-parser');

const ASSET_ALIASES = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  tether: 'USDT',
};

function normalizeAsset(asset) {
  if (!asset) return null;
  const lower = asset.trim().toLowerCase();
  return ASSET_ALIASES[lower] || asset.trim().toUpperCase();
}

function normalizeType(type) {
  if (!type) return null;
  return type.trim().toUpperCase();
}

function parseQuantity(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function parseTimestamp(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function validateRow(row, rowNumber, source) {
  const errors = [];

  if (!row.transaction_id) errors.push('missing transaction_id');
  if (!row.asset) errors.push('missing asset');
  if (!row.type) errors.push('missing type');

  const qty = parseQuantity(row.quantity);
  if (qty === null) errors.push('invalid or missing quantity');

  const ts = parseTimestamp(row.timestamp);
  if (ts === null) errors.push('invalid or missing timestamp');

  return { valid: errors.length === 0, errors, qty, ts };
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const valid = [];
    const invalid = [];
    let rowNumber = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        rowNumber++;
        const source = filePath.includes('user') ? 'user' : 'exchange';
        const { valid: isValid, errors, qty, ts } = validateRow(row, rowNumber, source);

        if (!isValid) {
          invalid.push({
            rowNumber,
            reason: errors.join('; '),
            rawData: row,
          });
          return;
        }

        valid.push({
          txId: row.transaction_id.trim(),
          asset: normalizeAsset(row.asset),
          type: normalizeType(row.type),
          quantity: qty,
          priceUsd: parseQuantity(row.price_usd),
          fee: parseQuantity(row.fee),
          timestamp: ts,
          rawData: row,
        });
      })
      .on('end', () => resolve({ valid, invalid }))
      .on('error', reject);
  });
}

module.exports = { parseCSV, normalizeAsset, normalizeType };
