const User = require('../models/User');
const Draw = require('../models/Draw');

// Configuration
const CONTRIBUTION_PER_SUBSCRIBER = 5; // £5 per subscriber goes to prize pool
const TIER_DISTRIBUTION = {
  '5-match': 0.40,  // 40% of pool
  '4-match': 0.35,  // 35% of pool
  '3-match': 0.25   // 25% of pool
};

/**
 * Get all eligible users (active subscription + exactly 5 scores)
 */
async function getEligibleUsers() {
  return User.find({
    'subscription.status': 'active',
    'scores': { $size: 5 }
  }).select('_id name email scores');
}

/**
 * Generate 5 random winning numbers (1-45)
 */
function generateRandomNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate winning numbers using algorithmic/weighted method
 * Based on frequency analysis of all user scores
 */
async function generateAlgorithmicNumbers(eligibleUsers) {
  // Count frequency of each score value across all users
  const frequency = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 0;

  eligibleUsers.forEach(user => {
    user.scores.forEach(score => {
      frequency[score.value] = (frequency[score.value] || 0) + 1;
    });
  });

  // Create weighted pool — less common scores get higher weight
  // This makes winning slightly harder (picks numbers players use less)
  const maxFreq = Math.max(...Object.values(frequency)) + 1;
  const weightedPool = [];

  for (let num = 1; num <= 45; num++) {
    const weight = maxFreq - frequency[num]; // Inverse frequency
    for (let i = 0; i < weight; i++) {
      weightedPool.push(num);
    }
  }

  // Pick 5 unique numbers from weighted pool
  const numbers = new Set();
  while (numbers.size < 5) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    numbers.add(weightedPool[idx]);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Match user scores against winning numbers
 * Returns array of matched numbers (order doesn't matter)
 */
function matchScores(userScores, winningNumbers) {
  const userValues = userScores.map(s => s.value);
  return winningNumbers.filter(n => userValues.includes(n));
}

/**
 * Determine tier based on match count
 */
function getTier(matchCount) {
  if (matchCount >= 5) return '5-match';
  if (matchCount === 4) return '4-match';
  if (matchCount === 3) return '3-match';
  return null;
}

/**
 * Calculate prize pool and distribute across tiers
 */
function calculatePrizePool(subscriberCount, previousRollover = 0) {
  const total = (subscriberCount * CONTRIBUTION_PER_SUBSCRIBER) + previousRollover;
  return {
    total,
    fiveMatch: Math.round(total * TIER_DISTRIBUTION['5-match'] * 100) / 100,
    fourMatch: Math.round(total * TIER_DISTRIBUTION['4-match'] * 100) / 100,
    threeMatch: Math.round(total * TIER_DISTRIBUTION['3-match'] * 100) / 100
  };
}

/**
 * Run a full draw simulation
 * @param {string} drawType - 'random' or 'algorithmic'
 * @param {number} previousRollover - rollover amount from previous draw
 * @returns {object} Draw simulation results (not saved to DB)
 */
async function simulateDraw(drawType = 'random', previousRollover = 0) {
  const eligibleUsers = await getEligibleUsers();

  if (eligibleUsers.length === 0) {
    throw new Error('No eligible users for the draw');
  }

  // Generate winning numbers
  const winningNumbers = drawType === 'algorithmic'
    ? await generateAlgorithmicNumbers(eligibleUsers)
    : generateRandomNumbers();

  // Calculate prize pool
  const prizePool = calculatePrizePool(eligibleUsers.length, previousRollover);

  // Match all users
  const results = [];
  const tierCounts = { '5-match': 0, '4-match': 0, '3-match': 0 };

  eligibleUsers.forEach(user => {
    const matchedNumbers = matchScores(user.scores, winningNumbers);
    const matchCount = matchedNumbers.length;
    const tier = getTier(matchCount);

    if (tier) {
      tierCounts[tier]++;
      results.push({
        userId: user._id,
        matchedNumbers,
        matchCount,
        tier,
        prizeAmount: 0, // Calculated after we know tier splits
        verificationStatus: 'pending',
        paymentStatus: 'pending'
      });
    }
  });

  // Calculate prize amounts (split equally within tiers)
  results.forEach(result => {
    const tierPool = {
      '5-match': prizePool.fiveMatch,
      '4-match': prizePool.fourMatch,
      '3-match': prizePool.threeMatch
    }[result.tier];

    result.prizeAmount = Math.round((tierPool / tierCounts[result.tier]) * 100) / 100;
  });

  // Check if jackpot rolls over
  const jackpotRolledOver = tierCounts['5-match'] === 0;
  const rolloverAmount = jackpotRolledOver ? prizePool.fiveMatch : 0;

  return {
    winningNumbers,
    prizePool,
    results,
    jackpotRolledOver,
    rolloverAmount,
    eligibleCount: eligibleUsers.length,
    tierCounts,
    drawType
  };
}

module.exports = {
  simulateDraw,
  getEligibleUsers,
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  matchScores,
  getTier,
  calculatePrizePool,
  CONTRIBUTION_PER_SUBSCRIBER,
  TIER_DISTRIBUTION
};
