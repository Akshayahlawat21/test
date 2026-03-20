/**
 * Winner controller.
 * Handles winner proof uploads, winnings retrieval, and public winner listing.
 */
const Draw = require('../models/Draw');

/** POST /api/winners/:drawId/upload-proof — upload verification screenshot */
const uploadProof = async (req, res, next) => {
  try {
    const { drawId } = req.params;
    const { proofImageUrl } = req.body;

    if (!proofImageUrl) {
      return res.status(400).json({ error: 'Proof image URL is required' });
    }

    const draw = await Draw.findById(drawId);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    const result = draw.results.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );
    if (!result) {
      return res.status(404).json({
        error: 'No winning result found for this user in this draw',
      });
    }

    if (result.verificationStatus === 'approved') {
      return res
        .status(400)
        .json({ error: 'This result has already been verified' });
    }

    result.proofImage = proofImageUrl;
    result.verificationStatus = 'pending';
    await draw.save();

    res.json({
      message: 'Proof uploaded successfully. Awaiting admin verification.',
      result,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/winners/my-winnings — get current user's all winnings across draws */
const getMyWinnings = async (req, res, next) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'results.userId': req.user._id,
    }).sort({ month: -1 });

    const winnings = draws.map((draw) => {
      const result = draw.results.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );
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
        proofImage: result.proofImage,
        publishedAt: draw.publishedAt,
      };
    });

    const totalWon = winnings.reduce((sum, w) => sum + w.prizeAmount, 0);
    const totalPaid = winnings
      .filter((w) => w.paymentStatus === 'paid')
      .reduce((sum, w) => sum + w.prizeAmount, 0);
    const totalPending = totalWon - totalPaid;

    res.json({ winnings, totalWon, totalPaid, totalPending });
  } catch (err) {
    next(err);
  }
};

/** GET /api/winners — list recent winners (public) */
const listWinners = async (req, res, next) => {
  try {
    const draws = await Draw.find({ status: 'published', 'results.0': { $exists: true } })
      .populate('results.userId', 'name')
      .sort({ month: -1 })
      .limit(10);

    const winners = [];
    draws.forEach((draw) => {
      draw.results.forEach((result) => {
        winners.push({
          drawId: draw._id,
          month: draw.month,
          user: result.userId,
          tier: result.tier,
          prizeAmount: result.prizeAmount,
          matchCount: result.matchCount,
        });
      });
    });

    res.json({ winners });
  } catch (err) {
    next(err);
  }
};

/** GET /api/winners/:drawId — get winners for a specific draw (public) */
const getDrawWinners = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.drawId)
      .populate('results.userId', 'name');

    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    if (draw.status !== 'published') {
      return res.status(400).json({ error: 'Draw results not yet published' });
    }

    res.json({
      month: draw.month,
      winningNumbers: draw.winningNumbers,
      results: draw.results.map((r) => ({
        user: r.userId,
        matchCount: r.matchCount,
        tier: r.tier,
        prizeAmount: r.prizeAmount,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadProof,
  getMyWinnings,
  listWinners,
  getDrawWinners,
};
