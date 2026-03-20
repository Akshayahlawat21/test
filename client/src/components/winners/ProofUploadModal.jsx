import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export default function ProofUploadModal({ isOpen, onClose, onSubmit, loading }) {
  const [proofUrl, setProofUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proofUrl.trim()) return;
    onSubmit(proofUrl.trim());
  };

  const handleUrlChange = (value) => {
    setProofUrl(value);
    // Show preview if it looks like a valid image URL
    if (value.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || value.startsWith('data:image')) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl('');
    }
  };

  const handleClose = () => {
    setProofUrl('');
    setPreviewUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Upload Proof</h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Provide a URL to your verification screenshot (scorecard photo, app screenshot, etc.)
              </p>

              {/* Drop zone / URL input area */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors">
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Proof preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                      onError={() => setPreviewUrl('')}
                    />
                    <p className="text-xs text-gray-400">Image preview</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PhotoIcon className="h-10 w-10 mx-auto text-gray-300" />
                    <p className="text-sm text-gray-400">Paste your image URL below</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="proofUrl"
                  type="url"
                  value={proofUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/scorecard.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !proofUrl.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Upload Proof
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
