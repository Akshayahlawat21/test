const express = require('express');
const router = express.Router();
const winnerController = require('../controllers/winnerController');
const auth = require('../middleware/auth');

// GET /api/winners - List recent winners (public)
router.get('/', winnerController.listWinners);

// GET /api/winners/my-winnings - Get current user's winnings (auth required)
router.get('/my-winnings', auth, winnerController.getMyWinnings);

// POST /api/winners/:drawId/upload-proof - Upload verification proof (auth required)
router.post('/:drawId/upload-proof', auth, winnerController.uploadProof);

// GET /api/winners/:drawId - Get winners for a specific draw (public)
router.get('/:drawId', winnerController.getDrawWinners);

module.exports = router;
