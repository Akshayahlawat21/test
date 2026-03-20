/**
 * Authentication controller.
 * Handles register, login, token refresh, and current user retrieval.
 */
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const Charity = require('../models/Charity');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { sendWelcomeEmail } = require('../utils/emailService');
const env = require('../config/env');

// ---- Validation Schemas ----

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').trim(),
  charityId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ---- Cookie options for refresh token ----

const refreshCookieOptions = {
  httpOnly: true,
  secure: !env.isDev,
  sameSite: env.isDev ? 'lax' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// ---- Controller Methods ----

/**
 * POST /api/auth/register
 * Register a new user account.
 */
const register = async (req, res, next) => {
  try {
    // Validate input
    const data = registerSchema.parse(req.body);

    // Check if email already exists
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with 12 rounds of bcrypt
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Build user object
    const userFields = {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
    };

    // If a charity was selected, validate and set it
    if (data.charityId) {
      const charity = await Charity.findById(data.charityId);
      if (charity && charity.active) {
        userFields.charity = {
          charityId: charity._id,
          contributionPercent: 10,
        };
      }
    }

    const user = await User.create(userFields);

    // Generate token pair
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail(user).catch(() => {});

    res.status(201).json({
      message: 'Registration successful',
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (err) {
    // Zod validation errors
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors || err.issues,
      });
    }
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return tokens.
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const data = loginSchema.parse(req.body);

    // Find user by email (include passwordHash for comparison)
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate token pair
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token (rotation)
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
      message: 'Login successful',
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors || err.issues,
      });
    }
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh the access token using the refresh token from cookie.
 * Implements refresh token rotation for security.
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token provided.' });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Find the user and verify the stored token matches (rotation check)
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      // Token reuse detected - invalidate all tokens for this user
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
      return res.status(401).json({ error: 'Refresh token has been revoked.' });
    }

    // Generate new token pair (rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Return the current authenticated user's profile.
 */
const me = async (req, res, next) => {
  try {
    // req.user is set by the auth middleware (already excludes sensitive fields)
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Clear the refresh token cookie and invalidate the stored token.
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      // Invalidate the refresh token in DB
      const decoded = verifyRefreshToken(token);
      if (decoded) {
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
    }

    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
  registerSchema,
  loginSchema,
};
