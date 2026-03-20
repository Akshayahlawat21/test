const Draw = require('../models/Draw');
const { simulateDraw, getEligibleUsers } = require('../utils/drawEngine');

// GET /api/draws/current — current/upcoming draw info
exports.getCurrentDraw = async (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-03"

    let draw = await Draw.findOne({ month: currentMonth });

    // Get eligible user count for pool estimate
    const eligibleUsers = await getEligibleUsers();

    // Calculate next draw date (last day of current month)
    const now = new Date();
    const nextDrawDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 20, 0, 0); // Last day at 8 PM

    // Get previous draw for rollover info
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
    const previousDraw = await Draw.findOne({ month: previousMonth, status: 'published' });

    res.json({
      draw: draw || null,
      nextDrawDate,
      eligibleCount: eligibleUsers.length,
      estimatedPool: eligibleUsers.length * 5 + (previousDraw?.rolloverAmount || 0),
      rolloverFromPrevious: previousDraw?.rolloverAmount || 0
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/draws/history — past draw results
exports.getDrawHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [draws, total] = await Promise.all([
      Draw.find({ status: 'published' })
        .sort({ month: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Draw.countDocuments({ status: 'published' })
    ]);

    res.json({
      draws,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/draws/:id — single draw detail
exports.getDrawById = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id)
      .populate('results.userId', 'name email');

    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    // If user is authenticated, find their result
    let userResult = null;
    if (req.user) {
      userResult = draw.results.find(r => r.userId._id.toString() === req.user._id.toString());
    }

    res.json({ draw, userResult });
  } catch (error) {
    next(error);
  }
};

// GET /api/draws/my-results — user's draw participation history
exports.getMyResults = async (req, res, next) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'results.userId': req.user._id
    }).sort({ month: -1 });

    const myResults = draws.map(draw => {
      const result = draw.results.find(r => r.userId.toString() === req.user._id.toString());
      return {
        drawId: draw._id,
        month: draw.month,
        winningNumbers: draw.winningNumbers,
        matchedNumbers: result.matchedNumbers,
        matchCount: result.matchCount,
        tier: result.tier,
        prizeAmount: result.prizeAmount,
        verificationStatus: result.verificationStatus,
        paymentStatus: result.paymentStatus,
        publishedAt: draw.publishedAt
      };
    });

    const totalWon = myResults.reduce((sum, r) => sum + r.prizeAmount, 0);

    res.json({ results: myResults, totalWon });
  } catch (error) {
    next(error);
  }
};
