const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require authentication + admin role
router.use(auth, admin);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);

// Reports
router.get('/reports', adminController.getReports);

// Stats (legacy alias)
router.get('/stats', adminController.getStats);

// Draws
router.post('/draws', adminController.createDraw);
router.post('/draws/simulate', adminController.simulateDrawAdmin);
router.post('/draws/publish/:id', adminController.publishDraw);
router.put('/draws/:id/config', adminController.configDraw);
router.post('/draws/:id/execute', adminController.executeDraw);

// Charities
router.get('/charities', adminController.listCharities);
router.post('/charities', adminController.createCharity);
router.put('/charities/:id', adminController.updateCharity);
router.delete('/charities/:id', adminController.deleteCharity);

// Winner management
router.get('/winners', adminController.getWinners);
router.put('/winners/:drawId/:resultId/verify', adminController.verifyWinner);
router.put('/winners/:drawId/:resultId/payout', adminController.payoutWinner);

module.exports = router;
