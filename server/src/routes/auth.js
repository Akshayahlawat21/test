const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/register - Create a new account
router.post('/register', validate(authController.registerSchema), authController.register);

// POST /api/auth/login - Authenticate and get tokens
router.post('/login', validate(authController.loginSchema), authController.login);

// POST /api/auth/refresh - Refresh access token using cookie
router.post('/refresh', authController.refresh);

// GET /api/auth/me - Get current user profile (requires auth)
router.get('/me', auth, authController.me);

// POST /api/auth/logout - Clear refresh token
router.post('/logout', authController.logout);

module.exports = router;
