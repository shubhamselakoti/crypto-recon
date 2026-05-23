import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import { getReport } from '../api/index.js';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'matched', label: 'Matched' },
  { value: 'conflicting', label: 'Conflicting' },
  { value: 'unmatched_user', label: 'User Only' },
  { value: 'unmatched_exchange', label: 'Exchange Only' },
];

function fmt(val, decimals = 6) {
  if (val === null || val === undefined) return '—';
  return Number(val).toFixed(decimals);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function exportCSV(results) {
  const headers = ['Category', 'Asset', 'Type', 'Quantity', 'Timestamp', 'Qty Diff', 'Time Diff (s)', 'Reason'];
  const rows = results.map((r) => [
    r.category,
    r.asset || '',
    r.type || '',
    r.quantity || '',
    r.timestamp ? new Date(r.timestamp).toISOString() : '',
    r.quantityDiff ?? '',
    r.timestampDiffSec ?? '',
    `"${(r.reason || '').replace(/"/g, "'")}"`,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reconciliation_report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Report() {
  const { runId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchReport = useCallback(() => {
    setLoading(true);
    getReport(runId, { page, limit: 15, category, search })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [runId, page, category, search]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  if (error) {
    return (
      <div className="clay-card p-10 text-center max-w-lg mx-auto mt-12">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="font-bold text-gray-700 text-lg">{error}</h2>
        <Link to="/" className="mt-4 inline-block text-indigo-600 text-sm underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const summary = data?.run?.summary || {};
  const results = data?.results || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 font-medium">Report</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Reconciliation Report</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{runId}</p>
        </div>
        <button
          onClick={() => results.length > 0 && exportCSV(results)}
          className="clay-btn px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-700 flex items-center gap-2"
        >
          <span>⬇</span> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Matched" value={summary.matched} icon="✓" color="green" delay={0} />
        <StatCard label="Conflicts" value={summary.conflicting} icon="⚠" color="amber" delay={0.05} />
        <StatCard label="User Only" value={summary.unmatchedUser} icon="👤" color="rose" delay={0.1} />
        <StatCard label="Exchange Only" value={summary.unmatchedExchange} icon="🏦" color="purple" delay={0.15} />
      </div>

      {/* Success Rate Banner */}
      {summary.successRate !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="clay-card p-5 flex items-center gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Match Rate</span>
              <span className="text-lg font-bold text-indigo-700">{summary.successRate}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #43e97b, #38f9d7)' }}
                initial={{ width: 0 }}
                animate={{ width: `${summary.successRate}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-200">{summary.total}</div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="clay-card p-5 space-y-4"
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => handleCategory(c.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === c.value
                    ? 'text-white shadow-md'
                    : 'clay-btn text-gray-600'
                }`}
                style={category === c.value ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search asset, type…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="clay-input px-3 py-1.5 rounded-xl text-sm text-gray-700 outline-none w-44"
            />
            <button
              type="submit"
              className="clay-btn px-3 py-1.5 rounded-xl text-sm text-gray-600"
            >
              🔍
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 font-semibold pr-4">Status</th>
                  <th className="pb-3 font-semibold pr-4">Asset</th>
                  <th className="pb-3 font-semibold pr-4">Type</th>
                  <th className="pb-3 font-semibold pr-4">Quantity</th>
                  <th className="pb-3 font-semibold pr-4 hidden lg:table-cell">Timestamp</th>
                  <th className="pb-3 font-semibold pr-4 hidden xl:table-cell">Qty Δ</th>
                  <th className="pb-3 font-semibold pr-4 hidden xl:table-cell">Time Δ</th>
                  <th className="pb-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="py-3 pr-4">
                      <StatusBadge category={r.category} />
                    </td>
                    <td className="py-3 pr-4 font-bold text-gray-800">{r.asset || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-mono">
                        {r.type || '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-gray-700 text-xs">{fmt(r.quantity)}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs hidden lg:table-cell">{fmtDate(r.timestamp)}</td>
                    <td className="py-3 pr-4 text-xs hidden xl:table-cell">
                      {r.quantityDiff !== null && r.quantityDiff !== undefined ? (
                        <span className={r.quantityDiff > 0 ? 'text-amber-600' : 'text-gray-400'}>
                          {fmt(r.quantityDiff)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-xs hidden xl:table-cell">
                      {r.timestampDiffSec !== null && r.timestampDiffSec !== undefined ? (
                        <span className={r.timestampDiffSec > 60 ? 'text-amber-600' : 'text-gray-500'}>
                          {r.timestampDiffSec}s
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 text-xs text-gray-500 max-w-xs">
                      <span className="line-clamp-2">{r.reason || '—'}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination page={pagination.page || 1} pages={pagination.pages || 1} onPage={setPage} />
        {!loading && pagination.total > 0 && (
          <p className="text-center text-xs text-gray-400">
            Showing {results.length} of {pagination.total} results
          </p>
        )}
      </motion.div>
    </div>
  );
}
