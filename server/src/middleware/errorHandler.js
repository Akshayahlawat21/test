/**
 * Global error handler middleware.
 * Catches all unhandled errors, logs them, and returns clean JSON responses.
 */
const env = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  // ── Logging ──
  if (env.isDev) {
    console.error('[Error]', err);
  } else {
    console.error(`[Error] ${err.name || 'Error'}: ${err.message}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: err.statusCode || 500,
    });
  }

  // ── Mongoose ValidationError ──
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation error',
      details: messages,
    });
  }

  // ── Mongoose Duplicate Key Error (code 11000) ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      error: 'Duplicate entry',
      message: `A record with this ${field} already exists.`,
    });
  }

  // ── Mongoose CastError (invalid ObjectId, etc.) ──
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: `Invalid value for ${err.path}: "${err.value}".`,
    });
  }

  // ── JWT Errors ──
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided authentication token is invalid.',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Your session has expired. Please log in again.',
    });
  }

  // ── Zod Validation Errors ──
  if (err.name === 'ZodError' || (err.issues && Array.isArray(err.issues))) {
    const messages = (err.issues || err.errors || []).map(
      (issue) => `${issue.path?.join('.') || 'field'}: ${issue.message}`
    );
    return res.status(400).json({
      error: 'Validation error',
      details: messages,
    });
  }

  // ── Stripe Errors ──
  if (err.type && err.type.startsWith('Stripe')) {
    const statusMap = {
      StripeCardError: 402,
      StripeRateLimitError: 429,
      StripeInvalidRequestError: 400,
      StripeAPIError: 502,
      StripeConnectionError: 502,
      StripeAuthenticationError: 401,
    };
    const statusCode = statusMap[err.type] || 500;
    return res.status(statusCode).json({
      error: 'Payment error',
      message: env.isDev ? err.message : 'A payment processing error occurred. Please try again.',
    });
  }

  // ── SyntaxError (malformed JSON body) ──
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Malformed request',
      message: 'The request body contains invalid JSON.',
    });
  }

  // ── Default server error ──
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
    ...(env.isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
