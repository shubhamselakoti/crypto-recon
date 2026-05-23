import { motion } from 'framer-motion';

const colorMap = {
  indigo: {
    bg: 'linear-gradient(135deg, #667eea22, #764ba222)',
    icon: 'linear-gradient(135deg, #667eea, #764ba2)',
    text: 'text-indigo-700',
    val: 'text-indigo-800',
  },
  green: {
    bg: 'linear-gradient(135deg, #43e97b22, #38f9d722)',
    icon: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    text: 'text-emerald-700',
    val: 'text-emerald-800',
  },
  amber: {
    bg: 'linear-gradient(135deg, #f6d36522, #fda08522)',
    icon: 'linear-gradient(135deg, #f6d365, #fda085)',
    text: 'text-amber-700',
    val: 'text-amber-800',
  },
  rose: {
    bg: 'linear-gradient(135deg, #ff6b6b22, #ee000022)',
    icon: 'linear-gradient(135deg, #ff6b6b, #ee0979)',
    text: 'text-rose-700',
    val: 'text-rose-800',
  },
  purple: {
    bg: 'linear-gradient(135deg, #a18cd122, #fbc2eb22)',
    icon: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    text: 'text-purple-700',
    val: 'text-purple-800',
  },
};

export default function StatCard({ label, value, icon, color = 'indigo', suffix = '', delay = 0 }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="clay-card p-5 flex items-center gap-4"
      style={{ background: `linear-gradient(145deg, #ffffff, #eef0f8)` }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ background: c.icon }}
      >
        {icon}
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${c.text}`}>{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.val}`}>
          {value !== undefined && value !== null ? value : '—'}
          {suffix}
        </p>
      </div>
    </motion.div>
  );
}
