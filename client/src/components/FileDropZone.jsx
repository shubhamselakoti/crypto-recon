import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileDropZone({ label, accept = '.csv', onFile, file, color = 'indigo' }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const colorRing = color === 'purple' ? 'ring-purple-400' : 'ring-indigo-400';
  const colorBg = color === 'purple'
    ? 'linear-gradient(145deg, #f5f0ff, #ede8ff)'
    : 'linear-gradient(145deg, #f0f4ff, #e8eeff)';
  const colorIcon = color === 'purple'
    ? 'linear-gradient(135deg, #a18cd1, #fbc2eb)'
    : 'linear-gradient(135deg, #667eea, #764ba2)';

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`clay-card p-6 cursor-pointer transition-all duration-200 ${dragging ? `ring-2 ${colorRing}` : ''}`}
      style={file ? { background: colorBg } : {}}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: colorIcon }}>
              📄
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl transition-transform ${dragging ? 'scale-110' : ''}`}
              style={{ background: colorIcon }}>
              {dragging ? '⬇' : '☁'}
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-1">Drag & drop or click to browse</p>
              <p className="text-xs text-gray-400">CSV files only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
