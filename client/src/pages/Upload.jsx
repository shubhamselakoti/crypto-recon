import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FileDropZone from '../components/FileDropZone.jsx';
import { uploadCSVs, runReconciliation } from '../api/index.js';

const STEPS = ['Upload Files', 'Configure', 'Reconcile'];

export default function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userFile, setUserFile] = useState(null);
  const [exchangeFile, setExchangeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState('');
  const [tolerances, setTolerances] = useState({
    timestampToleranceSec: 300,
    quantityTolerancePct: 0.01,
  });

  const handleUpload = async () => {
    if (!userFile || !exchangeFile) {
      setError('Please select both files');
      return;
    }
    setError('');
    setUploading(true);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append('user_file', userFile);
      form.append('exchange_file', exchangeFile);
      const res = await uploadCSVs(form, setUploadProgress);
      setUploadResult(res.data);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReconcile = async () => {
    setError('');
    setReconciling(true);
    try {
      const res = await runReconciliation({
        runId: uploadResult.runId,
        ...tolerances,
      });
      navigate(`/report/${res.data.reconcileRunId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Reconciliation failed');
      setReconciling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload & Reconcile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload your CSV files to begin reconciliation</p>
      </div>

      {/* Step indicator */}
      <div className="clay-card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  i < step
                    ? 'text-white'
                    : i === step
                    ? 'text-white ring-2 ring-offset-1 ring-indigo-400'
                    : 'text-gray-400 bg-gray-100'
                }`}
                style={i <= step ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : {}}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-indigo-700' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-100 rounded" />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Upload */}
        {step === 0 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                  User Transactions
                </p>
                <FileDropZone
                  label="user_transactions.csv"
                  onFile={setUserFile}
                  file={userFile}
                  color="indigo"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                  Exchange Transactions
                </p>
                <FileDropZone
                  label="exchange_transactions.csv"
                  onFile={setExchangeFile}
                  file={exchangeFile}
                  color="purple"
                />
              </div>
            </div>

            {/* Progress bar */}
            {uploading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Uploading & parsing…</span>
                  <span className="text-xs font-bold text-indigo-600">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-4 py-3">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={uploading || !userFile || !exchangeFile}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {uploading ? 'Uploading…' : 'Upload Files →'}
            </motion.button>
          </motion.div>
        )}

        {/* Step 1: Configure */}
        {step === 1 && uploadResult && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Upload summary */}
            <div className="clay-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✅</span>
                <h3 className="font-bold text-gray-700">Files Uploaded Successfully</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-emerald-50 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-emerald-700">{uploadResult.userTransactions}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">User Txns</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-purple-700">{uploadResult.exchangeTransactions}</p>
                  <p className="text-xs text-purple-600 mt-0.5">Exchange Txns</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-amber-700">{uploadResult.ingestionErrors}</p>
                  <p className="text-xs text-amber-600 mt-0.5">Parse Errors</p>
                </div>
              </div>

              {uploadResult.errors?.length > 0 && (
                <details className="mt-4">
                  <summary className="text-xs text-amber-600 cursor-pointer font-medium">
                    View {uploadResult.errors.length} ingestion error(s)
                  </summary>
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                    {uploadResult.errors.map((e, i) => (
                      <div key={i} className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700">
                        <span className="font-semibold">[{e.source} row {e.rowNumber}]</span> {e.reason}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Tolerance settings */}
            <div className="clay-card p-5 space-y-4">
              <h3 className="font-bold text-gray-700">Reconciliation Tolerances</h3>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Timestamp Tolerance (seconds)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="3600"
                    step="30"
                    value={tolerances.timestampToleranceSec}
                    onChange={(e) => setTolerances((t) => ({ ...t, timestampToleranceSec: Number(e.target.value) }))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="clay-input px-3 py-1.5 rounded-xl text-sm font-bold text-indigo-700 w-16 text-center">
                    {tolerances.timestampToleranceSec}s
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Quantity Tolerance (%)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={tolerances.quantityTolerancePct}
                    onChange={(e) => setTolerances((t) => ({ ...t, quantityTolerancePct: Number(e.target.value) }))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="clay-input px-3 py-1.5 rounded-xl text-sm font-bold text-indigo-700 w-16 text-center">
                    {tolerances.quantityTolerancePct}%
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="clay-btn px-5 py-3 rounded-2xl text-sm font-medium text-gray-600"
              >
                ← Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReconcile}
                disabled={reconciling}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 shadow-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                {reconciling ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Running Reconciliation…
                  </span>
                ) : (
                  'Run Reconciliation →'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
