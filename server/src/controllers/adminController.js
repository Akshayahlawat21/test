/**
 * Admin controller.
 * Handles user management, stats, charities, and draw management.
 */
const User = require('../models/User');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');
const Transaction = require('../models/Transaction');
const { simulateDraw } = require('../utils/drawEngine');

/** GET /api/admin/users — list/search users with pagination */
const getUsers = async (req, res, next) => {
  try {
    const { search, status, role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter['subscription.status'] = status;
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshToken')
        .populate('charity.charityId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/users/:id — edit user profile/subscription/scores */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allowedFields = ['name', 'email', 'role', 'subscription', 'scores'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'subscription') {
          Object.assign(user.subscription, req.body.subscription);
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();
    const updated = await User.findById(user._id)
      .select('-passwordHash -refreshToken')
      .populate('charity.charityId', 'name slug');
    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/reports — aggregated platform stats */
const getReports = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      monthlySubscribers,
      yearlySubscribers,
      totalCharities,
      activeCharities,
      publishedDraws,
      transactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.plan': 'monthly', 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.plan': 'yearly', 'subscription.status': 'active' }),
      Charity.countDocuments(),
      Charity.countDocuments({ active: true }),
      Draw.countDocuments({ status: 'published' }),
      Transaction.find()
    ]);

    // Calculate financial totals
    const totalSubscriptionRevenue = transactions
      .filter(t => t.type === 'subscription')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDonations = transactions
      .filter(t => t.type === 'charity_donation')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayouts = transactions
      .filter(t => t.type === 'prize_payout')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get charity contribution totals
    const charityTotals = await Charity.find({ active: true })
      .select('name totalReceived')
      .sort({ totalReceived: -1 })
      .limit(10);

    // Get draw stats
    const draws = await Draw.find({ status: 'published' }).sort({ month: -1 }).limit(12);
    const drawStats = draws.map(d => ({
      month: d.month,
      totalPool: d.prizePool.total,
      winners: d.results.length,
      jackpotRolledOver: d.jackpotRolledOver
    }));

    // Monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Revenue by month (last 6 months)
    const revenueByMonth = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, type: 'subscription' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        activeSubscribers,
        monthlySubscribers,
        yearlySubscribers,
        totalCharities,
        activeCharities,
        publishedDraws
      },
      financials: {
        totalSubscriptionRevenue,
        totalDonations,
        totalPayouts,
        netRevenue: totalSubscriptionRevenue - totalPayouts
      },
      charityTotals,
      drawStats,
      userGrowth,
      revenueByMonth
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/stats - Get platform statistics (legacy) */
const getStats = async (req, res, next) => {
  try {
    // Redirect to reports for backward compat
    return getReports(req, res, next);
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/draws - Create a new draw */
const createDraw = async (req, res, next) => {
  try {
    const { month, drawType = 'random' } = req.body;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const existing = await Draw.findOne({ month: targetMonth });
    if (existing) {
      return res.status(400).json({ error: 'Draw already exists for this month' });
    }

    const draw = await Draw.create({
      month: targetMonth,
      drawType,
      status: 'pending'
    });

    res.status(201).json({ draw });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/draws/:id/execute - Execute a draw */
const executeDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    if (draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published' });
    }

    const previousMonth = new Date(draw.month + '-01');
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const prevMonthStr = previousMonth.toISOString().slice(0, 7);
    const previousDraw = await Draw.findOne({ month: prevMonthStr, status: 'published' });
    const rollover = previousDraw?.rolloverAmount || 0;

    const simulation = await simulateDraw(draw.drawType, rollover);

    draw.status = 'simulated';
    draw.winningNumbers = simulation.winningNumbers;
    draw.prizePool = simulation.prizePool;
    draw.results = simulation.results;
    draw.jackpotRolledOver = simulation.jackpotRolledOver;
    draw.rolloverAmount = simulation.rolloverAmount;
    await draw.save();

    res.json({ draw });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/charities - Create a charity */
const createCharity = async (req, res, next) => {
  try {
    const { name, description, slug, featured, images, events } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const charitySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Charity.findOne({ slug: charitySlug });
    if (existing) {
      return res.status(400).json({ error: 'A charity with this slug already exists' });
    }

    const charity = await Charity.create({
      name,
      description,
      slug: charitySlug,
      featured: featured || false,
      images: images || [],
      events: events || [],
    });

    res.status(201).json({ charity });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/charities/:id - Update a charity */
const updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ error: 'Charity not found' });

    const allowedFields = ['name', 'description', 'slug', 'featured', 'active', 'images', 'events'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        charity[field] = req.body[field];
      }
    });

    await charity.save();
    res.json({ charity });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/charities/:id - Soft delete a charity */
const deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ error: 'Charity not found' });

    charity.active = false;
    await charity.save();

    res.json({ message: 'Charity deactivated', charity });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/charities — list all charities (including inactive) */
const listCharities = async (req, res, next) => {
  try {
    const charities = await Charity.find().sort({ createdAt: -1 });
    res.json({ charities });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/draws/simulate — run simulation without publishing */
const simulateDrawAdmin = async (req, res, next) => {
  try {
    const { drawType = 'random' } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Check if draw already published for this month
    const existingPublished = await Draw.findOne({ month: currentMonth, status: 'published' });
    if (existingPublished) {
      return res.status(400).json({ error: 'Draw already published for this month' });
    }

    // Get rollover from previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
    const previousDraw = await Draw.findOne({ month: previousMonth, status: 'published' });
    const rollover = previousDraw?.rolloverAmount || 0;

    const simulation = await simulateDraw(drawType, rollover);

    // Save as pending/simulated draw
    let draw = await Draw.findOne({ month: currentMonth });
    if (draw) {
      draw.status = 'simulated';
      draw.drawType = drawType;
      draw.winningNumbers = simulation.winningNumbers;
      draw.prizePool = simulation.prizePool;
      draw.results = simulation.results;
      draw.jackpotRolledOver = simulation.jackpotRolledOver;
      draw.rolloverAmount = simulation.rolloverAmount;
      await draw.save();
    } else {
      draw = await Draw.create({
        month: currentMonth,
        status: 'simulated',
        drawType,
        winningNumbers: simulation.winningNumbers,
        prizePool: simulation.prizePool,
        results: simulation.results,
        jackpotRolledOver: simulation.jackpotRolledOver,
        rolloverAmount: simulation.rolloverAmount
      });
    }

    res.json({
      draw,
      stats: {
        eligibleCount: simulation.eligibleCount,
        tierCounts: simulation.tierCounts,
        totalWinners: simulation.results.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/admin/draws/publish/:id — publish draw results */
const publishDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }
    if (draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published' });
    }
    if (draw.status !== 'simulated') {
      return res.status(400).json({ error: 'Draw must be simulated before publishing' });
    }

    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();

    res.json({ message: 'Draw published successfully', draw });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/draws/:id/config — set draw type */
const configDraw = async (req, res, next) => {
  try {
    const { drawType } = req.body;
    if (!['random', 'algorithmic'].includes(drawType)) {
      return res.status(400).json({ error: 'Invalid draw type' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    let draw = await Draw.findOne({ month: currentMonth });

    if (!draw) {
      draw = await Draw.create({ month: currentMonth, drawType, status: 'pending' });
    } else {
      if (draw.status === 'published') {
        return res.status(400).json({ error: 'Cannot modify published draw' });
      }
      draw.drawType = drawType;
      await draw.save();
    }

    res.json({ draw });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/winners — all winners with filters */
const getWinners = async (req, res, next) => {
  try {
    const { status, paymentStatus, month } = req.query;

    const filter = { status: 'published', 'results.0': { $exists: true } };
    if (month) filter.month = month;

    let draws = await Draw.find(filter)
      .populate('results.userId', 'name email')
      .sort({ month: -1 });

    // Flatten results across draws and apply filters
    const allWinners = [];
    draws.forEach((draw) => {
      draw.results.forEach((result) => {
        if (status && result.verificationStatus !== status) return;
        if (paymentStatus && result.paymentStatus !== paymentStatus) return;

        allWinners.push({
          drawId: draw._id,
          month: draw.month,
          resultId: result._id,
          user: result.userId,
          matchedNumbers: result.matchedNumbers,
          matchCount: result.matchCount,
          tier: result.tier,
          prizeAmount: result.prizeAmount,
          verificationStatus: result.verificationStatus,
          paymentStatus: result.paymentStatus,
          proofImage: result.proofImage,
        });
      });
    });

    res.json({ winners: allWinners, total: allWinners.length });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/winners/:drawId/:resultId/verify — approve/reject winner */
const verifyWinner = async (req, res, next) => {
  try {
    const { drawId, resultId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be approved or rejected' });
    }

    const draw = await Draw.findById(drawId);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    const result = draw.results.id(resultId);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    result.verificationStatus = status;
    await draw.save();

    res.json({ message: `Winner ${status}`, result });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/winners/:drawId/:resultId/payout — mark as paid */
const payoutWinner = async (req, res, next) => {
  try {
    const { drawId, resultId } = req.params;

    const draw = await Draw.findById(drawId);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    const result = draw.results.id(resultId);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    if (result.verificationStatus !== 'approved') {
      return res
        .status(400)
        .json({ error: 'Winner must be verified before payout' });
    }

    result.paymentStatus = 'paid';
    await draw.save();

    // Create transaction record
    await Transaction.create({
      userId: result.userId,
      type: 'prize_payout',
      amount: result.prizeAmount,
      status: 'completed',
      description: `Prize payout for ${draw.month} draw - ${result.tier}`,
      metadata: { drawId: draw._id, resultId: result._id },
    });

    res.json({ message: 'Payout marked as complete', result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  updateUser,
  getReports,
  getStats,
  createDraw,
  executeDraw,
  createCharity,
  updateCharity,
  deleteCharity,
  listCharities,
  simulateDrawAdmin,
  publishDraw,
  configDraw,
  getWinners,
  verifyWinner,
  payoutWinner,
  // Legacy aliases
  listUsers: getUsers,
};
