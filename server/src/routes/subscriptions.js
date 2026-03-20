const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// POST /api/subscriptions/create-checkout - Start Stripe checkout
router.post('/create-checkout', auth, subscriptionController.createCheckout);

// GET /api/subscriptions/status - Get current subscription status
router.get('/status', auth, subscriptionController.getStatus);

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', auth, subscriptionController.cancelSubscription);

// POST /api/subscriptions/reactivate - Reactivate cancelled subscription
router.post('/reactivate', auth, subscriptionController.reactivateSubscription);

// NOTE: Webhook route is handled directly in index.js with raw body parser
// (must be registered before express.json() middleware)

module.exports = router;
