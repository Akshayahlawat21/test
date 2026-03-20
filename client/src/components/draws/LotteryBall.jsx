import { motion } from 'framer-motion';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
};

export default function LotteryBall({
  number,
  size = 'md',
  matched = false,
  glow = false,
  delay = 0,
  revealed = true,
}) {
  const baseClasses = `
    inline-flex items-center justify-center rounded-full font-bold
    border-2 select-none
    ${sizeClasses[size]}
  `;

  const colorClasses = matched
    ? 'bg-green-500 text-white border-green-400'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  const glowStyle = glow && matched
    ? { boxShadow: '0 0 16px 4px rgba(34, 197, 94, 0.4)' }
    : {};

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
        delay,
      }}
      className={`${baseClasses} ${colorClasses}`}
      style={glowStyle}
    >
      {revealed ? number : '?'}
    </motion.div>
  );
}
