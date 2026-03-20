import { motion } from 'framer-motion';

export default function SimpleChart({ data = [], title, color = '#3b82f6', height = 200 }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
        <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(20, Math.min(60, Math.floor(600 / data.length) - 12));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <div className="flex items-end justify-center gap-2" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = Math.max(4, (item.value / maxValue) * (height - 40));
          return (
            <div key={i} className="flex flex-col items-center gap-1" style={{ width: barWidth }}>
              <span className="text-xs text-gray-500 font-medium">
                {typeof item.value === 'number' && item.value >= 1000
                  ? `${(item.value / 1000).toFixed(1)}k`
                  : item.value}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="w-full rounded-t-md"
                style={{ backgroundColor: color, minWidth: 16 }}
              />
              <span className="text-[10px] text-gray-400 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
