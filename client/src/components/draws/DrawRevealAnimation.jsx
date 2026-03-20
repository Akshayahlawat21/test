import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LotteryBall from './LotteryBall';

export default function DrawRevealAnimation({
  winningNumbers = [],
  userNumbers = [],
  onComplete,
}) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const matchedNumbers = winningNumbers.filter((n) => userNumbers.includes(n));
  const matchCount = matchedNumbers.length;

  useEffect(() => {
    if (winningNumbers.length === 0) return;

    // Reveal balls one at a time
    const timers = winningNumbers.map((_, i) =>
      setTimeout(() => setRevealedCount(i + 1), (i + 1) * 800)
    );

    // Show result after all revealed
    const resultTimer = setTimeout(() => {
      setShowResult(true);
      if (onComplete) onComplete();
    }, (winningNumbers.length + 1) * 800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(resultTimer);
    };
  }, [winningNumbers, onComplete]);

  return (
    <div className="text-center py-8">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-gray-900 mb-6"
      >
        Draw Reveal
      </motion.h3>

      {/* Ball slots */}
      <div className="flex justify-center gap-4 mb-8">
        {winningNumbers.map((num, i) => (
          <div key={i} className="relative">
            {/* Empty slot */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              {i < revealedCount ? (
                <LotteryBall
                  number={num}
                  size="lg"
                  matched={userNumbers.includes(num)}
                  glow={userNumbers.includes(num)}
                  revealed={true}
                  delay={0}
                />
              ) : (
                <motion.span
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-gray-400 text-lg font-bold"
                >
                  ?
                </motion.span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {matchCount >= 3 ? (
              <div className="bg-green-50 rounded-2xl p-6 max-w-md mx-auto">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl mb-3"
                >
                  {matchCount === 5 ? '!!!': matchCount === 4 ? '!!' : '!'}
                </motion.div>
                <h4 className="text-xl font-bold text-green-700 mb-1">
                  {matchCount === 5 ? 'JACKPOT!' : matchCount === 4 ? 'Amazing!' : 'Winner!'}
                </h4>
                <p className="text-green-600">
                  You matched {matchCount} number{matchCount > 1 ? 's' : ''}!
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
                <h4 className="text-lg font-semibold text-gray-700 mb-1">
                  {matchCount === 0 ? 'No matches this time' : `${matchCount} match${matchCount > 1 ? 'es' : ''}`}
                </h4>
                <p className="text-gray-500 text-sm">
                  Better luck next month! Keep your scores updated.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
