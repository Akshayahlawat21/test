const Charity = require('../models/Charity');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { z } = require('zod');

// GET /api/charities — list charities with search/filter
exports.listCharities = async (req, res, next) => {
  try {
    const { search, featured, page = 1, limit = 12 } = req.query;

    const filter = { active: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (featured === 'true') filter.featured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [charities, total] = await Promise.all([
      Charity.find(filter)
        .sort({ featured: -1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Charity.countDocuments(filter),
    ]);

    res.json({
      charities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/charities/:slug — single charity profile
exports.getCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findOne({ slug: req.params.slug, active: true });
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    // Get supporter count
    const supporterCount = await User.countDocuments({
      'charity.charityId': charity._id,
    });

    res.json({ charity, supporterCount });
  } catch (error) {
    next(error);
  }
};

// PUT /api/charities/user/charity — update selected charity and contribution %
exports.updateUserCharity = async (req, res, next) => {
  try {
    const schema = z.object({
      charityId: z.string().length(24, 'Invalid charity ID'),
      contributionPercent: z.number().min(10).max(100).optional(),
    });

    const { charityId, contributionPercent } = schema.parse(req.body);

    // Verify charity exists and is active
    const charity = await Charity.findOne({ _id: charityId, active: true });
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found or inactive' });
    }

    const user = await User.findById(req.user._id);
    user.charity = {
      charityId: charity._id,
      contributionPercent:
        contributionPercent || user.charity?.contributionPercent || 10,
    };
    await user.save();

    res.json({
      message: 'Charity selection updated',
      charity: {
        charityId: charity._id,
        name: charity.name,
        contributionPercent: user.charity.contributionPercent,
      },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// POST /api/charities/donations — independent one-off donation
exports.createDonation = async (req, res, next) => {
  try {
    const schema = z.object({
      charityId: z.string().length(24),
      amount: z.number().min(1).max(10000),
    });

    const { charityId, amount } = schema.parse(req.body);

    const charity = await Charity.findOne({ _id: charityId, active: true });
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    // Create transaction record (in real app, this would go through Stripe first)
    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'charity_donation',
      amount,
      description: `Donation to ${charity.name}`,
      metadata: { charityId: charity._id, charityName: charity.name },
      status: 'completed',
    });

    // Update charity total
    charity.totalReceived += amount;
    await charity.save();

    res.status(201).json({
      message: 'Donation successful! Thank you for your generosity.',
      transaction,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// ADMIN: Create charity
exports.createCharity = async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(100),
      description: z.string().min(10).max(2000),
      images: z
        .array(
          z.object({
            url: z.string().url(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      featured: z.boolean().optional(),
      events: z
        .array(
          z.object({
            title: z.string(),
            date: z.string(),
            description: z.string().optional(),
            location: z.string().optional(),
          })
        )
        .optional(),
    });

    const data = schema.parse(req.body);

    // Auto-generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existing = await Charity.findOne({ slug });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'A charity with a similar name already exists' });
    }

    const charity = await Charity.create({ ...data, slug });
    res.status(201).json({ charity });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// ADMIN: Update charity
exports.updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    const allowedFields = [
      'name',
      'description',
      'images',
      'featured',
      'events',
      'active',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        charity[field] = req.body[field];
      }
    });

    // Regenerate slug if name changed
    if (req.body.name) {
      charity.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    await charity.save();
    res.json({ charity });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Delete charity (soft delete — set active: false)
exports.deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    charity.active = false;
    await charity.save();
    res.json({ message: 'Charity deactivated' });
  } catch (error) {
    next(error);
  }
};
