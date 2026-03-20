import { motion } from 'framer-motion';

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', border: 'border-teal-100' },
  gray: { bg: 'bg-gray-50', icon: 'text-gray-600', border: 'border-gray-100' },
};

export default function StatCard({ icon: Icon, label, value, trend, color = 'blue', index = 0 }) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={`bg-white rounded-2xl border ${colors.border} p-5 flex items-start gap-4`}
    >
      <div className={`${colors.bg} rounded-xl p-3 shrink-0`}>
        {Icon && <Icon className={`w-6 h-6 ${colors.icon}`} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {trend !== undefined && trend !== null && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs last month
          </p>
        )}
      </div>
    </motion.div>
  );
}
