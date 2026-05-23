const badgeMap = {
  matched: { label: 'Matched', class: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  conflicting: { label: 'Conflict', class: 'bg-amber-100 text-amber-700 ring-amber-200' },
  unmatched_user: { label: 'User Only', class: 'bg-rose-100 text-rose-700 ring-rose-200' },
  unmatched_exchange: { label: 'Exchange Only', class: 'bg-purple-100 text-purple-700 ring-purple-200' },
};

export default function StatusBadge({ category }) {
  const b = badgeMap[category] || { label: category, class: 'bg-gray-100 text-gray-600 ring-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${b.class}`}>
      {b.label}
    </span>
  );
}
