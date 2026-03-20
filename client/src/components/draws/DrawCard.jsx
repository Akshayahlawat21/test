import { motion } from 'framer-motion';
import LotteryBall from './LotteryBall';

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  simulated: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function DrawCard({ draw, userResult = null, onClick }) {
  const tierLabels = {
    '5-match': '5 Match (Jackpot)',
    '4-match': '4 Match',
    '3-match': '3 Match',
  };

  const winnerCount = draw.results?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-6 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {formatMonth(draw.month)}
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[draw.status] || statusBadge.pending}`}>
          {draw.status}
        </span>
      </div>

      {/* Winning Numbers */}
      {draw.winningNumbers && draw.winningNumbers.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {draw.winningNumbers.map((num, i) => (
            <LotteryBall
              key={i}
              number={num}
              size="md"
              matched={userResult?.matchedNumbers?.includes(num)}
              glow={userResult?.matchedNumbers?.includes(num)}
              delay={i * 0.08}
            />
          ))}
        </div>
      )}

      {/* Prize Pool */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Prize Pool</span>
        <span className="font-semibold text-gray-900">
          {'\u00A3'}{(draw.prizePool?.total || 0).toLocaleString()}
        </span>
      </div>

      {/* Winner counts */}
      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <div className="flex justify-between">
          <span>Total winners</span>
          <span className="font-medium">{winnerCount}</span>
        </div>
        {draw.jackpotRolledOver && (
          <div className="flex justify-between text-amber-600">
            <span>Jackpot rolled over</span>
            <span className="font-medium">{'\u00A3'}{(draw.rolloverAmount || 0).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* User result */}
      {userResult && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your result</span>
            <span className="font-semibold text-primary-600">
              {tierLabels[userResult.tier] || userResult.tier}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Prize</span>
            <span className="font-bold text-green-600">
              {'\u00A3'}{userResult.prizeAmount?.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
