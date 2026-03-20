import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  TicketIcon,
  TrophyIcon,
  ClockIcon,
  ArrowRightIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import SubscriptionBadge from '../../components/subscription/SubscriptionBadge';
import { cancelSubscription, reactivateSubscription } from '../../api/subscriptions';
import { getScores } from '../../api/scores';

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextSunday = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
      next.setHours(20, 0, 0, 0);
      return next;
    };

    const update = () => {
      const diff = getNextSunday() - new Date();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, val]) => (
        <div key={unit} className="text-center">
          <div className="bg-gray-900 text-white text-xl font-bold rounded-xl w-14 h-14 flex items-center justify-center">
            {String(val).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-400 mt-1 capitalize">{unit}</p>
        </div>
      ))}
    </div>
  );
}

function MiniLotteryBalls({ scores }) {
  const getBallColor = (v) => {
    if (v <= 15) return 'bg-red-400 text-white';
    if (v <= 30) return 'bg-amber-400 text-white';
    return 'bg-emerald-400 text-white';
  };

  return (
    <div className="flex gap-1.5 mt-2">
      {Array.from({ length: 5 }).map((_, i) => {
        const score = scores[i];
        return (
          <div
            key={score?._id || `e-${i}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              score ? getBallColor(score.value) : 'bg-gray-100 text-gray-300'
            }`}
          >
            {score ? score.value : '?'}
          </div>
        );
      })}
    </div>
  );
}

const recentActivity = [
  { text: 'Score submitted for Round #12', time: '2 hours ago' },
  { text: 'Entered Draw #34', time: '1 day ago' },
  { text: 'Subscription renewed', time: '3 days ago' },
  { text: 'Score submitted for Round #11', time: '5 days ago' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OverviewPage() {
  const { user, updateUser } = useAuth();
  const subscription = user?.subscription;
  const subStatus = subscription?.status || 'inactive';
  const isActive = subStatus === 'active';
  const isCancelled = subStatus === 'cancelled';
  const hasSubscription = isActive || isCancelled;

  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [userScores, setUserScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(true);

  useEffect(() => {
    if (isActive) {
      getScores()
        .then(({ data }) => setUserScores(data.scores || []))
        .catch(() => {})
        .finally(() => setScoresLoading(false));
    } else {
      setScoresLoading(false);
    }
  }, [isActive]);

  const quickStats = [
    { label: 'Scores Entered', value: scoresLoading ? '--' : String(userScores.length), icon: ClipboardDocumentListIcon, color: 'bg-primary-50 text-primary-500' },
    { label: 'Draws Entered', value: '0', icon: TicketIcon, color: 'bg-warm-50 text-warm-600' },
    { label: 'Total Won', value: '\u00a30', icon: TrophyIcon, color: 'bg-accent-50 text-accent-600' },
  ];

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelSubscription();
      updateUser({
        subscription: { ...subscription, status: 'cancelled' },
      });
      toast.success('Subscription will be cancelled at the end of the billing period.');
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel subscription.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivate = async () => {
    setReactivateLoading(true);
    try {
      await reactivateSubscription();
      updateUser({
        subscription: { ...subscription, status: 'active' },
      });
      toast.success('Subscription reactivated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reactivate subscription.');
    } finally {
      setReactivateLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Golfer'}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <SubscriptionBadge status={subStatus} size="sm" />
        </div>
      </motion.div>

      {/* Subscription Status Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <CreditCardIcon className="h-5 w-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900">Subscription</h2>
        </div>

        {hasSubscription ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Plan</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
                  {subscription?.plan || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <SubscriptionBadge status={subStatus} size="sm" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {isCancelled ? 'Access Until' : 'Renews On'}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(subscription?.currentPeriodEnd)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-50">
              {isActive && !showCancelConfirm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Subscription
                </Button>
              )}

              {isActive && showCancelConfirm && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Are you sure?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    loading={cancelLoading}
                  >
                    Yes, Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Never mind
                  </Button>
                </div>
              )}

              {isCancelled && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReactivate}
                  loading={reactivateLoading}
                >
                  Reactivate Subscription
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">
              You don&apos;t have an active subscription. Subscribe to enter scores, join draws, and support charities.
            </p>
            <Link to="/pricing">
              <Button>Subscribe Now</Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Next Draw Countdown */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-warm-500" />
          <h2 className="font-semibold text-gray-900">Next Draw</h2>
        </div>
        <CountdownTimer />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Scores / Lottery Numbers CTA */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-gradient-to-r from-primary-500 to-warm-500 rounded-2xl p-6 text-white"
      >
        {userScores.length >= 5 ? (
          <>
            <h3 className="font-bold text-lg mb-1">Your Lottery Numbers</h3>
            <p className="text-white/80 text-sm mb-3">
              You&apos;re qualified for the next draw! Here are your numbers:
            </p>
            <MiniLotteryBalls scores={userScores} />
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1">
              {userScores.length > 0
                ? `${5 - userScores.length} more score${5 - userScores.length !== 1 ? 's' : ''} to qualify`
                : 'Enter scores to join the draw'}
            </h3>
            <p className="text-white/80 text-sm mb-3">
              You need 5 Stableford scores to qualify for the monthly draw. Log your latest round now.
            </p>
            {userScores.length > 0 && <MiniLotteryBalls scores={userScores} />}
          </>
        )}
        <Link to="/dashboard/scores" className="inline-block mt-4">
          <Button className="!bg-white !text-primary-600 hover:!bg-gray-50" size="sm">
            {userScores.length >= 5 ? 'Manage Scores' : 'Enter Scores'} <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <p className="text-sm text-gray-700">{item.text}</p>
              <p className="text-xs text-gray-400 shrink-0 ml-4">{item.time}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
