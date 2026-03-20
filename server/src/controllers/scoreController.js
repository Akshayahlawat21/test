const User = require('../models/User');
const { z } = require('zod');

const scoreSchema = z.object({
  value: z.number().int().min(1).max(45),
  date: z.string().refine(d => !isNaN(new Date(d).getTime()), { message: 'Invalid date' })
});

// GET /api/scores — get user's scores sorted newest first
exports.getScores = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('scores');
    const scores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ scores, count: scores.length, maxAllowed: 5 });
  } catch (error) {
    next(error);
  }
};

// POST /api/scores — add a score (auto-replace oldest if 5 exist)
exports.addScore = async (req, res, next) => {
  try {
    const { value, date } = scoreSchema.parse(req.body);
    const user = await User.findById(req.user._id);

    if (user.scores.length >= 5) {
      // Find and remove the oldest score
      const oldest = user.scores.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      user.scores.pull(oldest._id);
    }

    user.scores.push({ value, date: new Date(date) });
    await user.save();

    const scores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(201).json({
      message: user.scores.length > 4 ? 'Score added, oldest score replaced' : 'Score added successfully',
      scores,
      count: scores.length
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// PUT /api/scores/:id — edit a specific score
exports.updateScore = async (req, res, next) => {
  try {
    const { value, date } = scoreSchema.parse(req.body);
    const user = await User.findById(req.user._id);

    const score = user.scores.id(req.params.id);
    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    score.value = value;
    score.date = new Date(date);
    await user.save();

    const scores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ message: 'Score updated successfully', scores, count: scores.length });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// DELETE /api/scores/:id — delete a specific score
exports.deleteScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const score = user.scores.id(req.params.id);
    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    user.scores.pull(score._id);
    await user.save();

    const scores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ message: 'Score deleted successfully', scores, count: scores.length });
  } catch (error) {
    next(error);
  }
};
