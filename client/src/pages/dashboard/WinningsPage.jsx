import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import WinningCard from '../../components/winners/WinningCard';
import ProofUploadModal from '../../components/winners/ProofUploadModal';
import { getMyWinnings, uploadProof } from '../../api/winners';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function WinningsPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [winnings, setWinnings] = useState([]);
  const [stats, setStats] = useState({ totalWon: 0, totalPaid: 0, totalPending: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWinning, setSelectedWinning] = useState(null);

  const fetchWinnings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getMyWinnings();
      setWinnings(data.winnings || []);
      setStats({
        totalWon: data.totalWon || 0,
        totalPaid: data.totalPaid || 0,
        totalPending: data.totalPending || 0,
      });
    } catch {
      toast.error('Failed to load winnings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWinnings();
  }, [fetchWinnings]);

  const handleUploadProof = (winning) => {
    setSelectedWinning(winning);
    setModalOpen(true);
  };

  const handleSubmitProof = async (proofImageUrl) => {
    if (!selectedWinning) return;
    try {
      setUploading(true);
      await uploadProof(selectedWinning.drawId, { proofImageUrl });
      toast.success('Proof uploaded successfully!');
      setModalOpen(false);
      setSelectedWinning(null);
      fetchWinnings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Won',
      value: `\u20AC${stats.totalWon.toLocaleString()}`,
      icon: TrophyIcon,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Total Paid',
      value: `\u20AC${stats.totalPaid.toLocaleString()}`,
      icon: CheckCircleIcon,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Pending Payout',
      value: `\u20AC${stats.totalPending.toLocaleString()}`,
      icon: ClockIcon,
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Winnings</h1>
        <p className="text-gray-500 text-sm mb-8">
          Track your prizes and payouts
        </p>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LoadingSkeleton variant="card" count={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <LoadingSkeleton variant="card" count={2} />
            </div>
          </div>
        ) : winnings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <EmptyState
              icon={BanknotesIcon}
              title="No winnings yet"
              description="Keep entering your scores! When you match numbers in a draw, your winnings will appear here."
            />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {statCards.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Winnings list */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {winnings.map((w, i) => (
                <WinningCard
                  key={`${w.drawId}-${i}`}
                  winning={w}
                  winningNumbers={w.winningNumbers}
                  onUploadProof={handleUploadProof}
                  index={i}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>

      <ProofUploadModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedWinning(null);
        }}
        onSubmit={handleSubmitProof}
        loading={uploading}
      />
    </div>
  );
}
