const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');
const auth = require('../middleware/auth');

// GET /api/draws/current - Get current active draw (public)
router.get('/current', drawController.getCurrentDraw);

// GET /api/draws/history - Past draw results (public)
router.get('/history', drawController.getDrawHistory);

// GET /api/draws/my-results - User's draw participation (auth required)
router.get('/my-results', auth, drawController.getMyResults);

// GET /api/draws/:id - Get a specific draw (optional auth - pass user if available)
router.get('/:id', async (req, res, next) => {
  // Optional auth: try to extract user but don't fail if no token
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyAccessToken } = require('../utils/tokenUtils');
      const User = require('../models/User');
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-passwordHash -refreshToken');
        if (user) req.user = user;
      }
    }
  } catch {
    // Ignore auth errors for optional auth
  }
  next();
}, drawController.getDrawById);

module.exports = router;
