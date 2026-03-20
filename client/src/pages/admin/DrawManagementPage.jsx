import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketIcon, PlayIcon, MegaphoneIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { simulateDraw, publishDraw, configDraw, getAllDraws } from '../../api/admin';
import { getCurrentDraw, getDrawHistory } from '../../api/draws';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import LotteryBall from '../../components/draws/LotteryBall';

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function DrawManagementPage() {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [drawType, setDrawType] = useState('random');
  const [simulation, setSimulation] = useState(null);
  const [pastDraws, setPastDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.all([
        getCurrentDraw(),
        getDrawHistory({ page: 1, limit: 20 }),
      ]);

      setCurrentDraw(currentRes.data);
      setPastDraws(historyRes.data.draws);

      if (currentRes.data.draw?.drawType) {
        setDrawType(currentRes.data.draw.drawType);
      }
    } catch (err) {
      console.error('Failed to load draw data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setError('');
    try {
      const drawId = currentDraw?.draw?._id;
      if (drawId) {
        await configDraw(drawId, { drawType });
      }
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setError('');
    setSimulation(null);
    try {
      const res = await simulateDraw({ drawType });
      setSimulation(res.data);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    const drawId = simulation?.draw?._id || currentDraw?.draw?._id;
    if (!drawId) return;

    setPublishing(true);
    setError('');
    try {
      await publishDraw(drawId);
      setShowConfirm(false);
      setSimulation(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish draw');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  const activeDrawStatus = currentDraw?.draw?.status;
  const isPublished = activeDrawStatus === 'published';
  const isSimulated = activeDrawStatus === 'simulated';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Draw Management</h1>
      <p className="text-gray-500 text-sm mb-8">Configure, simulate, and publish monthly draws</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Current Month Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TicketIcon className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {formatMonth(new Date().toISOString().slice(0, 7))} Draw
          </h2>
          {activeDrawStatus && (
            <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${
              isPublished ? 'bg-green-100 text-green-800' :
              isSimulated ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {activeDrawStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Eligible Players</p>
            <p className="text-2xl font-bold text-gray-900">{currentDraw?.eligibleCount || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Estimated Pool</p>
            <p className="text-2xl font-bold text-gray-900">
              {'\u00A3'}{(currentDraw?.estimatedPool || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Rollover</p>
            <p className="text-2xl font-bold text-amber-600">
              {'\u00A3'}{(currentDraw?.rolloverFromPrevious || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Draw Configuration */}
      {!isPublished && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Draw Configuration</h2>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="drawType"
                value="random"
                checked={drawType === 'random'}
                onChange={(e) => setDrawType(e.target.value)}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Random</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="drawType"
                value="algorithmic"
                checked={drawType === 'algorithmic'}
                onChange={(e) => setDrawType(e.target.value)}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Algorithmic (weighted)</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveConfig}
              loading={savingConfig}
              variant="outline"
              size="sm"
            >
              Save Config
            </Button>
            <Button
              onClick={handleSimulate}
              loading={simulating}
              size="sm"
            >
              <PlayIcon className="h-4 w-4 mr-1.5" />
              Run Simulation
            </Button>
          </div>
        </div>
      )}

      {/* Simulation Results */}
      <AnimatePresence>
        {simulation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 overflow-hidden"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h2>

            {/* Winning Numbers */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Winning Numbers</p>
              <div className="flex gap-3">
                {simulation.draw.winningNumbers.map((num, i) => (
                  <LotteryBall key={i} number={num} size="lg" matched delay={i * 0.1} />
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Eligible</p>
                <p className="text-lg font-bold">{simulation.stats.eligibleCount}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Winners</p>
                <p className="text-lg font-bold">{simulation.stats.totalWinners}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Prize Pool</p>
                <p className="text-lg font-bold">{'\u00A3'}{simulation.draw.prizePool?.total?.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Rollover</p>
                <p className="text-lg font-bold text-amber-600">
                  {'\u00A3'}{(simulation.draw.rolloverAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tier Breakdown */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Winners by Tier</p>
              <div className="space-y-2">
                {[
                  { tier: '5-match', label: '5 Match (Jackpot)', pool: simulation.draw.prizePool?.fiveMatch },
                  { tier: '4-match', label: '4 Match', pool: simulation.draw.prizePool?.fourMatch },
                  { tier: '3-match', label: '3 Match', pool: simulation.draw.prizePool?.threeMatch },
                ].map(({ tier, label, pool }) => (
                  <div key={tier} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-700">{label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        {simulation.stats.tierCounts[tier]} winner{simulation.stats.tierCounts[tier] !== 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {'\u00A3'}{(pool || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Winner List */}
            {simulation.draw.results && simulation.draw.results.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Winner Details</p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {simulation.draw.results.map((result, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2.5">
                      <span className="text-gray-600 font-mono text-xs truncate max-w-[200px]">
                        {result.userId}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{result.tier}</span>
                        <span className="text-xs text-gray-500">{result.matchCount} matches</span>
                        <span className="font-semibold text-green-600">
                          {'\u00A3'}{result.prizeAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publish Button */}
            {!isPublished && (
              <div className="pt-4 border-t border-gray-100">
                {showConfirm ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-700 flex-1">
                      Are you sure? This will make results visible to all users.
                    </p>
                    <Button
                      onClick={() => setShowConfirm(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePublish}
                      loading={publishing}
                      variant="danger"
                      size="sm"
                    >
                      Confirm Publish
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowConfirm(true)}
                    size="sm"
                  >
                    <MegaphoneIcon className="h-4 w-4 mr-1.5" />
                    Publish Draw
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past Draws Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Draws</h2>

        {pastDraws.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Month</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Winners</th>
                  <th className="pb-3 font-medium text-right">Prize Pool</th>
                  <th className="pb-3 font-medium text-right">Rollover</th>
                </tr>
              </thead>
              <tbody>
                {pastDraws.map((draw) => (
                  <tr key={draw._id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      {formatMonth(draw.month)}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        draw.status === 'published' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {draw.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{draw.drawType || '-'}</td>
                    <td className="py-3 text-gray-600">{draw.results?.length || 0}</td>
                    <td className="py-3 text-right font-medium">
                      {'\u00A3'}{(draw.prizePool?.total || 0).toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-amber-600">
                      {draw.jackpotRolledOver ? `\u00A3${(draw.rolloverAmount || 0).toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No past draws yet.</p>
        )}
      </div>
    </motion.div>
  );
}
