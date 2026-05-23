import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⬡' },
  { path: '/upload', label: 'Upload CSV', icon: '↑' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #e8ecf4 0%, #f0f2f7 50%, #e4e8f5 100%)' }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col p-5 gap-4">
        <div className="clay-card p-5 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              ₿
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-sm leading-none">CryptoRecon</h1>
              <p className="text-xs text-gray-500 mt-0.5">Reconciliation Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`clay-card px-4 py-3 flex items-center gap-3 cursor-pointer transition-all ${
                    active
                      ? 'ring-2 ring-indigo-400 ring-offset-1'
                      : ''
                  }`}
                  style={active ? { background: 'linear-gradient(145deg, #eef0ff, #e0e4ff)' } : {}}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`font-medium text-sm ${active ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto clay-card p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Upload your transaction CSVs and run reconciliation to detect matches, conflicts, and discrepancies.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden clay-card m-4 mb-0 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              ₿
            </div>
            <span className="font-bold text-gray-800 text-sm">CryptoRecon</span>
          </div>
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                  location.pathname === item.path
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600'
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
