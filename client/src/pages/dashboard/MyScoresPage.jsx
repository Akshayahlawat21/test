import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ScoreCard from '../../components/scores/ScoreCard';
import ScoreEntryModal from '../../components/scores/ScoreEntryModal';
import { getScores, addScore, updateScore, deleteScore } from '../../api/scores';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function LotteryBall({ value, filled = true, index = 0 }) {
  const getBallColor = (v) => {
    if (!filled) return 'bg-gray-100 text-gray-300 border-gray-200';
    if (v <= 15) return 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-400';
    if (v <= 30) return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-amber-400';
    return 'bg-gradient-to-br from-emerald-400 to-green-500 text-white border-emerald-400';
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200, delay: index * 0.1 }}
      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-lg shadow-sm ${getBallColor(value)}`}
    >
      {filled ? value : '?'}
    </motion.div>
  );
}

export default function MyScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchScores = useCallback(async () => {
    try {
      const { data } = await getScores();
      setScores(data.scores || []);
    } catch (err) {
      toast.error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleAdd = () => {
    setEditingScore(null);
    setModalOpen(true);
  };

  const handleEdit = (score) => {
    setEditingScore(score);
    setModalOpen(true);
  };

  const handleDelete = (score) => {
    setDeleteConfirm(score);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { data } = await deleteScore(deleteConfirm._id);
      setScores(data.scores);
      toast.success('Score deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete score');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = async ({ value, date }) => {
    setSubmitting(true);
    try {
      if (editingScore) {
        const { data } = await updateScore(editingScore._id, { value, date });
        setScores(data.scores);
        toast.success('Score updated successfully');
      } else {
        const { data } = await addScore({ value, date });
        setScores(data.scores);
        toast.success(data.message || 'Score added successfully');
      }
      setModalOpen(false);
      setEditingScore(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save score');
    } finally {
      setSubmitting(false);
    }
  };

  const scoreCount = scores.length;
  const remaining = 5 - scoreCount;
  const progressPct = (scoreCount / 5) * 100;
  const isQualified = scoreCount >= 5;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="animate-pulse bg-gray-200 rounded h-7 w-48" />
            <div className="animate-pulse bg-gray-200 rounded h-4 w-72" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Golf Scores</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your last 5 Stableford scores are your lottery numbers in the monthly draw.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon className="h-4 w-4 mr-1.5" />
          Add Score
        </Button>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.05 }}
        className={`rounded-2xl border p-5 ${
          isQualified
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          {isQualified ? (
            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
          )}
          <span className="font-semibold text-gray-900">
            Score Progress: {scoreCount} of 5 entered
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/60 rounded-full h-3 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-3 rounded-full ${
              isQualified ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>

        <p className={`text-sm ${isQualified ? 'text-emerald-700' : 'text-amber-700'}`}>
          {isQualified
            ? "You're entered in the next draw!"
            : `Enter ${remaining} more score${remaining !== 1 ? 's' : ''} to qualify for the draw!`}
        </p>
      </motion.div>

      {/* Lottery Numbers Display */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">Your Lottery Numbers</h2>
        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const score = scores[i];
            return (
              <LotteryBall
                key={score?._id || `empty-${i}`}
                value={score?.value}
                filled={!!score}
                index={i}
              />
            );
          })}
          {!isQualified && (
            <span className="text-sm text-gray-400 ml-2">
              (need {remaining} more)
            </span>
          )}
        </div>
      </motion.div>

      {/* Score Cards Grid */}
      {scoreCount > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {scores.map((score, i) => (
                <ScoreCard
                  key={score._id}
                  score={score}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 p-8"
        >
          <EmptyState
            icon={ClipboardDocumentListIcon}
            title="No scores yet"
            description="You haven't entered any scores yet. Add your first Stableford score to get started!"
            actionLabel="Add Your First Score"
            onAction={handleAdd}
          />
        </motion.div>
      )}

      {/* Replacement Warning */}
      {scoreCount >= 5 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-4 border border-amber-200"
        >
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            When you add a 6th score, your oldest score will be automatically replaced.
          </p>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <InformationCircleIcon className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">How Scores Work</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-0.5">&#8226;</span>
            Enter your last 5 Stableford golf scores
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-0.5">&#8226;</span>
            Scores must be between 1-45 points
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-0.5">&#8226;</span>
            Your 5 scores become your lottery numbers
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-0.5">&#8226;</span>
            Each month, 5 winning numbers are drawn
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-0.5">&#8226;</span>
            Match 3, 4, or all 5 to win prizes!
          </li>
        </ul>
      </motion.div>

      {/* Score Entry Modal */}
      <ScoreEntryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingScore(null);
        }}
        onSubmit={handleSubmit}
        editingScore={editingScore}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Score?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete the score of{' '}
                <span className="font-semibold">{deleteConfirm.value}</span>? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
