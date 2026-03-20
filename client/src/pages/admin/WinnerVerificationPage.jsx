import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { getWinners, verifyWinner, payoutWinner } from '../../api/admin';

const verificationTabs = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const paymentFilters = [
  { key: '', label: 'All Payments' },
  { key: 'pending', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
];

const tierColors = {
  '5-match': 'bg-yellow-100 text-yellow-800',
  '4-match': 'bg-gray-100 text-gray-700',
  '3-match': 'bg-amber-50 text-amber-800',
};

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

const paymentColors = {
  pending: 'bg-blue-50 text-blue-700',
  paid: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
};

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month, 10) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export default function WinnerVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWinners = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (monthFilter) params.month = monthFilter;

      const { data } = await getWinners(params);
      setWinners(data.winners || []);

      // Extract unique months for filter
      const months = [...new Set((data.winners || []).map((w) => w.month))].sort().reverse();
      if (!monthFilter) setAvailableMonths(months);
    } catch {
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, monthFilter]);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  // Load all months on first load
  useEffect(() => {
    const loadMonths = async () => {
      try {
        const { data } = await getWinners({});
        const months = [...new Set((data.winners || []).map((w) => w.month))].sort().reverse();
        setAvailableMonths(months);
      } catch {
        // silent
      }
    };
    loadMonths();
  }, []);

  const handleVerify = async (drawId, resultId, status) => {
    try {
      setActionLoading(true);
      await verifyWinner(drawId, resultId, { status });
      toast.success(`Winner ${status === 'approved' ? 'approved' : 'rejected'}`);
      setConfirmAction(null);
      fetchWinners();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${status} winner`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayout = async (drawId, resultId) => {
    try {
      setActionLoading(true);
      await payoutWinner(drawId, resultId);
      toast.success('Payout marked as complete');
      setConfirmAction(null);
      fetchWinners();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process payout');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Winner Verification</h1>
      <p className="text-gray-500 text-sm mb-6">Verify and process draw winners</p>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>

        {/* Verification status tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {verificationTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {paymentFilters.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>

          {/* Month filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton variant="table-row" count={5} />
        </div>
      ) : winners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <EmptyState
            icon={ShieldCheckIcon}
            title="No winners found"
            description="No winners match the current filters. Try adjusting your filters or check back after a draw is published."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {winners.map((winner, i) => (
            <motion.div
              key={`${winner.drawId}-${winner.resultId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {winner.user?.name || 'Unknown User'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[winner.tier] || 'bg-gray-100 text-gray-600'}`}>
                      {winner.tier}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{winner.user?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatMonth(winner.month)} &middot; Matched: {winner.matchedNumbers?.join(', ')}
                  </p>
                </div>

                {/* Prize */}
                <div className="text-right lg:text-center flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900">
                    &euro;{winner.prizeAmount?.toLocaleString() ?? '0'}
                  </p>
                  <p className="text-xs text-gray-400">Prize</p>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[winner.verificationStatus] || ''}`}>
                    {winner.verificationStatus}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${paymentColors[winner.paymentStatus] || ''}`}>
                    {winner.paymentStatus}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View proof */}
                  {winner.proofImage && (
                    <button
                      onClick={() => setProofImage(winner.proofImage)}
                      className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                      title="View proof"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}

                  {/* Approve/Reject */}
                  {winner.verificationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'approve',
                            drawId: winner.drawId,
                            resultId: winner.resultId,
                            userName: winner.user?.name,
                          })
                        }
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'reject',
                            drawId: winner.drawId,
                            resultId: winner.resultId,
                            userName: winner.user?.name,
                          })
                        }
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Reject"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Mark as paid */}
                  {winner.verificationStatus === 'approved' &&
                    winner.paymentStatus === 'pending' && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'payout',
                            drawId: winner.drawId,
                            resultId: winner.resultId,
                            userName: winner.user?.name,
                            amount: winner.prizeAmount,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <BanknotesIcon className="h-3.5 w-3.5" />
                        Mark Paid
                      </button>
                    )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setConfirmAction(null)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {confirmAction.type === 'approve' && 'Approve Winner'}
                {confirmAction.type === 'reject' && 'Reject Winner'}
                {confirmAction.type === 'payout' && 'Confirm Payout'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {confirmAction.type === 'approve' &&
                  `Are you sure you want to approve ${confirmAction.userName}'s winning?`}
                {confirmAction.type === 'reject' &&
                  `Are you sure you want to reject ${confirmAction.userName}'s winning?`}
                {confirmAction.type === 'payout' &&
                  `Mark \u20AC${confirmAction.amount?.toLocaleString()} payout to ${confirmAction.userName} as complete?`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'approve') {
                      handleVerify(confirmAction.drawId, confirmAction.resultId, 'approved');
                    } else if (confirmAction.type === 'reject') {
                      handleVerify(confirmAction.drawId, confirmAction.resultId, 'rejected');
                    } else if (confirmAction.type === 'payout') {
                      handlePayout(confirmAction.drawId, confirmAction.resultId);
                    }
                  }}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center ${
                    confirmAction.type === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Image Viewer */}
      <AnimatePresence>
        {proofImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setProofImage(null)} />
            <motion.div
              className="relative max-w-2xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setProofImage(null)}
                className="absolute -top-10 right-0 p-1 text-white hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <img
                src={proofImage}
                alt="Winner proof"
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
