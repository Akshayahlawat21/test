const express = require('express');
const router = express.Router();
const charityController = require('../controllers/charityController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/', charityController.listCharities);

// Authenticated user routes (must be before /:slug to avoid conflicts)
router.put('/user/charity', auth, charityController.updateUserCharity);
router.post('/donations', auth, charityController.createDonation);

// Admin routes
router.post('/admin', auth, admin, charityController.createCharity);
router.put('/admin/:id', auth, admin, charityController.updateCharity);
router.delete('/admin/:id', auth, admin, charityController.deleteCharity);

// Dynamic slug route (must be last)
router.get('/:slug', charityController.getCharity);

module.exports = router;
