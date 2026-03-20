import { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';
import { getCurrentDraw, getDrawHistory, getMyResults } from '../../api/draws';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import LotteryBall from '../../components/draws/LotteryBall';
import DrawCard from '../../components/draws/DrawCard';
import DrawRevealAnimation from '../../components/draws/DrawRevealAnimation';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

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
  }, [targetDate]);

  return timeLeft;
}

export default function DrawResultsPage() {
  const { user } = useContext(AuthContext);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [myResults, setMyResults] = useState(null);
  const [drawHistory, setDrawHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showReveal, setShowReveal] = useState(false);

  const countdown = useCountdown(currentDraw?.nextDrawDate);

  const userScoreValues = user?.scores?.map((s) => s.value) || [];
  const hasFullScores = userScoreValues.length === 5;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.all([
        getCurrentDraw(),
        getDrawHistory({ page: 1, limit: 6 }),
      ]);

      setCurrentDraw(currentRes.data);
      setDrawHistory(historyRes.data.draws);
      setHistoryPagination(historyRes.data.pagination);

      // Check if draw was just published (within last hour) — trigger reveal
      const draw = currentRes.data.draw;
      if (draw?.status === 'published' && draw?.publishedAt) {
        const publishedAt = new Date(draw.publishedAt);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (publishedAt > oneHourAgo) {
          setShowReveal(true);
        }
      }

      // Load user results if authenticated
      if (user) {
        try {
          const myRes = await getMyResults();
          setMyResults(myRes.data);
        } catch {
          // User may have no results
        }
      }
    } catch (err) {
      console.error('Failed to load draw data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMoreHistory = async (page) => {
    try {
      const res = await getDrawHistory({ page, limit: 6 });
      setDrawHistory(res.data.draws);
      setHistoryPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Draw Results</h1>
        <p className="text-gray-500 text-sm mb-8">
          View upcoming draws, your results, and past draw history
        </p>

        {/* Reveal Animation (if draw just published) */}
        {showReveal && currentDraw?.draw?.winningNumbers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
          >
            <DrawRevealAnimation
              winningNumbers={currentDraw.draw.winningNumbers}
              userNumbers={userScoreValues}
              onComplete={() => {}}
            />
          </motion.div>
        )}

        {/* Current Draw Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">Current Draw</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Countdown */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Next draw in</p>
              {countdown.days !== undefined ? (
                <div className="flex justify-center gap-3">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hrs' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Sec' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <div className="bg-gray-900 text-white rounded-lg w-12 h-12 flex items-center justify-center text-lg font-bold">
                        {String(value).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Calculating...</p>
              )}
            </div>

            {/* Estimated Prize Pool */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Estimated Prize Pool</p>
              <p className="text-3xl font-bold text-gray-900">
                {'\u00A3'}{(currentDraw?.estimatedPool || 0).toLocaleString()}
              </p>
              {currentDraw?.rolloverFromPrevious > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Includes {'\u00A3'}{currentDraw.rolloverFromPrevious.toFixed(2)} rollover
                </p>
              )}
            </div>

            {/* Eligibility */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Status</p>
              {hasFullScores ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircleIcon className="h-6 w-6" />
                  <span className="font-semibold">Eligible</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <XCircleIcon className="h-6 w-6" />
                  <span className="font-semibold">
                    {user?.subscription?.status === 'active'
                      ? `Need ${5 - userScoreValues.length} more score${5 - userScoreValues.length > 1 ? 's' : ''}`
                      : 'Subscription required'}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {currentDraw?.eligibleCount || 0} eligible players
              </p>
            </div>
          </div>

          {/* Current draw winning numbers if published */}
          {currentDraw?.draw?.status === 'published' && currentDraw.draw.winningNumbers && !showReveal && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Winning Numbers</p>
              <div className="flex gap-3 flex-wrap">
                {currentDraw.draw.winningNumbers.map((num, i) => (
                  <LotteryBall
                    key={i}
                    number={num}
                    size="lg"
                    matched={userScoreValues.includes(num)}
                    glow={userScoreValues.includes(num)}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My Results Section */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrophyIcon className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">My Results</h2>
              {myResults?.totalWon > 0 && (
                <span className="ml-auto text-sm font-semibold text-green-600">
                  Total won: {'\u00A3'}{myResults.totalWon.toFixed(2)}
                </span>
              )}
            </div>

            {myResults?.results && myResults.results.length > 0 ? (
              <div className="space-y-4">
                {myResults.results.map((result) => (
                  <motion.div
                    key={result.drawId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {formatMonth(result.month)}
                      </h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        result.tier === '5-match' ? 'bg-yellow-100 text-yellow-800' :
                        result.tier === '4-match' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {result.tier}
                      </span>
                    </div>

                    {/* Winning numbers with matches highlighted */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {result.winningNumbers.map((num, i) => (
                        <LotteryBall
                          key={i}
                          number={num}
                          size="sm"
                          matched={result.matchedNumbers.includes(num)}
                          glow={result.matchedNumbers.includes(num)}
                          delay={i * 0.05}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {result.matchCount} match{result.matchCount > 1 ? 'es' : ''}
                      </span>
                      <span className="font-bold text-green-600">
                        {'\u00A3'}{result.prizeAmount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <EmptyState
                  icon={TrophyIcon}
                  title="No results yet"
                  description="You haven't participated in any draws yet. Make sure you have an active subscription and 5 scores submitted."
                />
              </div>
            )}
          </div>
        )}

        {/* Draw History Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Draw History</h2>

          {drawHistory.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drawHistory.map((draw) => {
                  const userResult = myResults?.results?.find((r) => r.drawId === draw._id);
                  return (
                    <DrawCard
                      key={draw._id}
                      draw={draw}
                      userResult={userResult}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {historyPagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: historyPagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => loadMoreHistory(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === historyPagination.page
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <EmptyState
                icon={TrophyIcon}
                title="No draws yet"
                description="There are no published draws yet. Check back after the first monthly draw."
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
