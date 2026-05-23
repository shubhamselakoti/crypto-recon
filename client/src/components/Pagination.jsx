import { motion } from 'framer-motion';

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="flex items-center gap-2 justify-center mt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="clay-btn px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-40"
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPage(1)} className="clay-btn px-3 py-1.5 rounded-xl text-sm text-gray-600">1</button>
          {start > 2 && <span className="text-gray-400 text-sm">…</span>}
        </>
      )}

      {nums.map((n) => (
        <motion.button
          key={n}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPage(n)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            n === page
              ? 'text-white shadow-md'
              : 'clay-btn text-gray-600'
          }`}
          style={n === page ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : {}}
        >
          {n}
        </motion.button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="text-gray-400 text-sm">…</span>}
          <button onClick={() => onPage(pages)} className="clay-btn px-3 py-1.5 rounded-xl text-sm text-gray-600">{pages}</button>
        </>
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="clay-btn px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
