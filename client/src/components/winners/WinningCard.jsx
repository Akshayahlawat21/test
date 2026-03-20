import { motion } from 'framer-motion';
import {
  TrophyIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const tierConfig = {
  '5-match': { label: '5 Match', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', accent: 'text-yellow-600' },
  '4-match': { label: '4 Match', color: 'bg-gray-100 text-gray-700 border-gray-200', accent: 'text-gray-500' },
  '3-match': { label: '3 Match', color: 'bg-amber-50 text-amber-800 border-amber-200', accent: 'text-amber-600' },
};

const verificationBadge = {
  pending: { label: 'Pending Review', icon: ClockIcon, color: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', icon: CheckCircleIcon, color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected', icon: XCircleIcon, color: 'bg-red-50 text-red-700' },
};

const paymentBadge = {
  pending: { label: 'Awaiting Payout', color: 'bg-blue-50 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Payment Failed', color: 'bg-red-50 text-red-700' },
};

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month, 10) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export default function WinningCard({ winning, winningNumbers, onUploadProof, index = 0 }) {
  const tier = tierConfig[winning.tier] || tierConfig['3-match'];
  const verification = verificationBadge[winning.verificationStatus] || verificationBadge.pending;
  const payment = paymentBadge[winning.paymentStatus] || paymentBadge.pending;
  const VerificationIcon = verification.icon;

  const showUploadButton =
    winning.verificationStatus === 'pending' && !winning.proofImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      {/* Top row: month + tier */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">{formatMonth(winning.month)}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${tier.color}`}>
          <TrophyIcon className={`h-3.5 w-3.5 ${tier.accent}`} />
          {tier.label}
        </span>
      </div>

      {/* Prize amount */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">
          &euro;{winning.prizeAmount?.toLocaleString() ?? '0'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Prize amount</p>
      </div>

      {/* Lottery balls */}
      {winningNumbers && winningNumbers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Winning Numbers</p>
          <div className="flex gap-2 flex-wrap">
            {winningNumbers.map((num) => {
              const isMatched = winning.matchedNumbers?.includes(num);
              return (
                <div
                  key={num}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isMatched
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {winning.matchCount} number{winning.matchCount !== 1 ? 's' : ''} matched
          </p>
        </div>
      )}

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${verification.color}`}>
          <VerificationIcon className="h-3.5 w-3.5" />
          {verification.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${payment.color}`}>
          <BanknotesIcon className="h-3.5 w-3.5" />
          {payment.label}
        </span>
      </div>

      {/* Upload proof button */}
      {showUploadButton && (
        <button
          onClick={() => onUploadProof?.(winning)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-200 text-emerald-600 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          Upload Proof
        </button>
      )}

      {/* Proof uploaded indicator */}
      {winning.proofImage && winning.verificationStatus === 'pending' && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          Proof submitted, awaiting review
        </p>
      )}
    </motion.div>
  );
}
