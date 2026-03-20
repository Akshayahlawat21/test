/**
 * JWT token utilities for access and refresh tokens.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a short-lived access token (default 15 min).
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiry }
  );
};

/**
 * Generate a long-lived refresh token (default 7 days).
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiry }
  );
};

/**
 * Verify an access token. Returns decoded payload or null.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwtAccessSecret);
  } catch {
    return null;
  }
};

/**
 * Verify a refresh token. Returns decoded payload or null.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
