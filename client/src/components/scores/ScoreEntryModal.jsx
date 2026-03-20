import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';

function getScoreLabel(value) {
  if (value <= 10) return { text: 'Beginner', color: 'text-red-500' };
  if (value <= 20) return { text: 'Developing', color: 'text-orange-500' };
  if (value <= 30) return { text: 'Intermediate', color: 'text-amber-500' };
  if (value <= 38) return { text: 'Good', color: 'text-lime-600' };
  return { text: 'Excellent', color: 'text-emerald-500' };
}

function getSliderBackground(value) {
  const pct = ((value - 1) / 44) * 100;
  return `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`;
}

export default function ScoreEntryModal({ isOpen, onClose, onSubmit, editingScore, loading }) {
  const [value, setValue] = useState(20);
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingScore) {
      setValue(editingScore.value);
      setDate(new Date(editingScore.date).toISOString().split('T')[0]);
    } else {
      setValue(20);
      setDate(new Date().toISOString().split('T')[0]);
    }
    setErrors({});
  }, [editingScore, isOpen]);

  const validate = () => {
    const errs = {};
    if (!Number.isInteger(value) || value < 1 || value > 45) {
      errs.value = 'Score must be an integer between 1 and 45';
    }
    if (!date) {
      errs.date = 'Date is required';
    } else if (isNaN(new Date(date).getTime())) {
      errs.date = 'Invalid date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ value, date });
  };

  const increment = () => setValue((v) => Math.min(45, v + 1));
  const decrement = () => setValue((v) => Math.max(1, v - 1));

  const label = getScoreLabel(value);
  const pct = Math.round(((value - 1) / 44) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingScore ? 'Edit Score' : 'Add New Score'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Score Value Display */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">{value}</div>
                <p className={`text-sm font-medium ${label.color}`}>{label.text}</p>
                <p className="text-xs text-gray-400 mt-1">{pct}% of max score</p>
              </div>

              {/* +/- Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={value <= 1}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30"
                >
                  <MinusIcon className="h-5 w-5 text-gray-600" />
                </button>

                {/* Slider */}
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="1"
                    max="45"
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary-500"
                    style={{
                      background: getSliderBackground(value),
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>45</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={increment}
                  disabled={value >= 45}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30"
                >
                  <PlusIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Manual input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (1-45)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={value}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setValue(Math.max(1, Math.min(45, v)));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.value ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-primary-300'
                  } focus:outline-none focus:ring-2 text-center text-lg font-semibold`}
                />
                {errors.value && (
                  <p className="text-xs text-red-500 mt-1">{errors.value}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Played
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.date ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-primary-300'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  type="submit"
                  loading={loading}
                >
                  {editingScore ? 'Update Score' : 'Add Score'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
