import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import { getAllRuns } from '../api/index.js';

const COLORS = ['#43e97b', '#f6d365', '#ff6b6b', '#a18cd1'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="clay-card px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700">{payload[0].name}</p>
        <p className="text-gray-500">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllRuns()
      .then((res) => setRuns(res.data.runs || []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  const latest = runs[0];
  const summary = latest?.summary || {};

  const pieData = latest
    ? [
        { name: 'Matched', value: summary.matched || 0 },
        { name: 'Conflicting', value: summary.conflicting || 0 },
        { name: 'User Only', value: summary.unmatchedUser || 0 },
        { name: 'Exchange Only', value: summary.unmatchedExchange || 0 },
      ].filter((d) => d.value > 0)
    : [];

  const barData = runs
    .slice(0, 6)
    .reverse()
    .map((r, i) => ({
      name: `Run ${i + 1}`,
      Matched: r.summary?.matched || 0,
      Conflicts: r.summary?.conflicting || 0,
      Unmatched: (r.summary?.unmatchedUser || 0) + (r.summary?.unmatchedExchange || 0),
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crypto Transaction Reconciliation Overview</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            + New Reconciliation
          </Link>
        </motion.div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : latest ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Matched" value={summary.matched} icon="✓" color="green" delay={0} />
          <StatCard label="Conflicts" value={summary.conflicting} icon="⚠" color="amber" delay={0.05} />
          <StatCard label="Unmatched" value={(summary.unmatchedUser || 0) + (summary.unmatchedExchange || 0)} icon="✗" color="rose" delay={0.1} />
          <StatCard label="Success Rate" value={summary.successRate} icon="%" color="indigo" suffix="%" delay={0.15} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card p-10 text-center"
        >
          <div className="text-5xl mb-4">🪙</div>
          <h2 className="text-lg font-bold text-gray-700">No Reconciliations Yet</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">Upload your CSV files and run your first reconciliation</p>
          <Link
            to="/upload"
            className="inline-block px-6 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            Get Started
          </Link>
        </motion.div>
      )}

      {/* Charts */}
      {latest && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="clay-card p-6"
          >
            <h2 className="font-bold text-gray-700 mb-4">Latest Run Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span className="text-xs text-gray-600">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="clay-card p-6"
          >
            <h2 className="font-bold text-gray-700 mb-4">Reconciliation History</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(val) => <span className="text-xs text-gray-600">{val}</span>} />
                  <Bar dataKey="Matched" fill="#43e97b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Conflicts" fill="#f6d365" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Unmatched" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 text-sm py-16">Not enough runs for history</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Recent Runs Table */}
      {runs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="clay-card p-6"
        >
          <h2 className="font-bold text-gray-700 mb-4">Recent Reconciliation Runs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 font-semibold">Run ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Matched</th>
                  <th className="pb-3 font-semibold">Conflicts</th>
                  <th className="pb-3 font-semibold">Success Rate</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {runs.map((run) => (
                  <tr key={run.runId} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="py-3 font-mono text-xs text-gray-500">{run.runId.slice(0, 8)}…</td>
                    <td className="py-3 text-gray-600">{new Date(run.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-emerald-600 font-semibold">{run.summary?.matched ?? 0}</td>
                    <td className="py-3 text-amber-600 font-semibold">{run.summary?.conflicting ?? 0}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                        {run.summary?.successRate ?? 0}%
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/report/${run.runId}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
