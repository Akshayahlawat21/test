const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const auth = require('../middleware/auth');
const subscriptionGate = require('../middleware/subscriptionGate');

// All score routes require auth + active subscription
router.use(auth, subscriptionGate);

// GET /api/scores - Get current scores
router.get('/', scoreController.getScores);

// POST /api/scores - Add a score
router.post('/', scoreController.addScore);

// PUT /api/scores/:id - Update a specific score
router.put('/:id', scoreController.updateScore);

// DELETE /api/scores/:id - Delete a specific score
router.delete('/:id', scoreController.deleteScore);

module.exports = router;
