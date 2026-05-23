// Reconciliation engine
// Matching rules:
// 1. Exact match (same asset, type, quantity, timestamp within tolerance)
// 2. Tolerance-based match
// 3. Conflict detection (same asset/type but quantity or timestamp diff outside tolerance)
// 4. Unmatched classification

const TRANSFER_EQUIVALENTS = {
  TRANSFER_OUT: 'TRANSFER_IN',
  TRANSFER_IN: 'TRANSFER_OUT',
};

function assetsMatch(a, b) {
  return a && b && a.toUpperCase() === b.toUpperCase();
}

function typesMatch(userType, exchType) {
  if (!userType || !exchType) return false;
  if (userType === exchType) return true;
  // TRANSFER_OUT on user side = TRANSFER_IN on exchange side
  return TRANSFER_EQUIVALENTS[userType] === exchType || TRANSFER_EQUIVALENTS[exchType] === userType;
}

function timestampDiffSec(ts1, ts2) {
  if (!ts1 || !ts2) return Infinity;
  return Math.abs(new Date(ts1).getTime() - new Date(ts2).getTime()) / 1000;
}

function quantityDiffPct(q1, q2) {
  if (q1 === null || q2 === null) return Infinity;
  if (q1 === 0 && q2 === 0) return 0;
  const avg = (Math.abs(q1) + Math.abs(q2)) / 2;
  if (avg === 0) return Infinity;
  return (Math.abs(q1 - q2) / avg) * 100;
}

function reconcile(userTxs, exchangeTxs, options = {}) {
  const tsSec = options.timestampToleranceSec ?? 300;
  const qtyPct = options.quantityTolerancePct ?? 0.01;

  const results = [];
  const matchedExchangeIds = new Set();

  for (const uTx of userTxs) {
    let bestMatch = null;
    let bestTsDiff = Infinity;
    let bestQtyDiff = Infinity;
    let bestCandidate = null;
    let bestCandidateTsDiff = Infinity;
    let bestCandidateQtyDiff = Infinity;

    for (const eTx of exchangeTxs) {
      if (matchedExchangeIds.has(eTx.txId)) continue;
      if (!assetsMatch(uTx.asset, eTx.asset)) continue;
      if (!typesMatch(uTx.type, eTx.type)) continue;

      const tsDiff = timestampDiffSec(uTx.timestamp, eTx.timestamp);
      const qtyDiffP = quantityDiffPct(uTx.quantity, eTx.quantity);

      const withinTs = tsDiff <= tsSec;
      const withinQty = qtyDiffP <= qtyPct;

      if (withinTs && withinQty) {
        if (tsDiff < bestTsDiff || (tsDiff === bestTsDiff && qtyDiffP < bestQtyDiff)) {
          bestMatch = eTx;
          bestTsDiff = tsDiff;
          bestQtyDiff = qtyDiffP;
        }
      } else {
        // Track best conflict candidate
        if (tsDiff < bestCandidateTsDiff) {
          bestCandidate = eTx;
          bestCandidateTsDiff = tsDiff;
          bestCandidateQtyDiff = qtyDiffP;
        }
      }
    }

    if (bestMatch) {
      matchedExchangeIds.add(bestMatch.txId);
      results.push({
        category: 'matched',
        reason: `Matched within ${Math.round(bestTsDiff)}s and ${bestQtyDiff.toFixed(4)}% qty diff`,
        userTransaction: uTx,
        exchangeTransaction: bestMatch,
        quantityDiff: Math.abs((uTx.quantity || 0) - (bestMatch.quantity || 0)),
        timestampDiffSec: Math.round(bestTsDiff),
        asset: uTx.asset,
        type: uTx.type,
        quantity: uTx.quantity,
        timestamp: uTx.timestamp,
      });
    } else if (bestCandidate && bestCandidateTsDiff <= tsSec * 10) {
      // Within 10x timestamp window - likely a conflict
      matchedExchangeIds.add(bestCandidate.txId);
      const reasons = [];
      if (bestCandidateTsDiff > tsSec)
        reasons.push(`timestamp diff ${Math.round(bestCandidateTsDiff)}s exceeds ${tsSec}s tolerance`);
      if (bestCandidateQtyDiff > qtyPct)
        reasons.push(`quantity diff ${bestCandidateQtyDiff.toFixed(4)}% exceeds ${qtyPct}% tolerance`);

      results.push({
        category: 'conflicting',
        reason: reasons.join('; '),
        userTransaction: uTx,
        exchangeTransaction: bestCandidate,
        quantityDiff: Math.abs((uTx.quantity || 0) - (bestCandidate.quantity || 0)),
        timestampDiffSec: Math.round(bestCandidateTsDiff),
        asset: uTx.asset,
        type: uTx.type,
        quantity: uTx.quantity,
        timestamp: uTx.timestamp,
      });
    } else {
      results.push({
        category: 'unmatched_user',
        reason: 'No corresponding exchange transaction found',
        userTransaction: uTx,
        exchangeTransaction: null,
        quantityDiff: null,
        timestampDiffSec: null,
        asset: uTx.asset,
        type: uTx.type,
        quantity: uTx.quantity,
        timestamp: uTx.timestamp,
      });
    }
  }

  // Remaining unmatched exchange transactions
  for (const eTx of exchangeTxs) {
    if (!matchedExchangeIds.has(eTx.txId)) {
      results.push({
        category: 'unmatched_exchange',
        reason: 'No corresponding user transaction found',
        userTransaction: null,
        exchangeTransaction: eTx,
        quantityDiff: null,
        timestampDiffSec: null,
        asset: eTx.asset,
        type: eTx.type,
        quantity: eTx.quantity,
        timestamp: eTx.timestamp,
      });
    }
  }

  const summary = {
    matched: results.filter((r) => r.category === 'matched').length,
    conflicting: results.filter((r) => r.category === 'conflicting').length,
    unmatchedUser: results.filter((r) => r.category === 'unmatched_user').length,
    unmatchedExchange: results.filter((r) => r.category === 'unmatched_exchange').length,
    total: results.length,
  };
  summary.successRate =
    summary.total > 0
      ? parseFloat(((summary.matched / summary.total) * 100).toFixed(2))
      : 0;

  return { results, summary };
}

module.exports = { reconcile };
