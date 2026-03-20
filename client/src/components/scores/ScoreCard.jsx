import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function getScoreColor(value) {
  if (value <= 15) return { bg: 'from-red-400 to-red-500', ring: '#ef4444' };
  if (value <= 30) return { bg: 'from-amber-400 to-yellow-500', ring: '#f59e0b' };
  return { bg: 'from-emerald-400 to-green-500', ring: '#10b981' };
}

function CircularProgress({ value, max = 45, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const color = getScoreColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.ring}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

export default function ScoreCard({ score, onEdit, onDelete, index = 0 }) {
  const color = getScoreColor(score.value);
  const formattedDate = new Date(score.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Color strip at top */}
      <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${color.bg} -mt-1`} />

      {/* Circular progress ring */}
      <CircularProgress value={score.value} />

      {/* Date */}
      <p className="text-sm text-gray-500">{formattedDate}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onEdit(score)}
          className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
          title="Edit score"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(score)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete score"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
