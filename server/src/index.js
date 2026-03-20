/**
 * Golf Charity Platform - Main Server Entry Point
 *
 * Sets up Express with all middleware, routes, and database connection.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const scoreRoutes = require('./routes/scores');
const drawRoutes = require('./routes/draws');
const charityRoutes = require('./routes/charities');
const winnerRoutes = require('./routes/winners');
const adminRoutes = require('./routes/admin');

const app = express();

// ---- Global Middleware ----

// Security headers
app.use(helmet());

// CORS - allow frontend origin with credentials
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Stripe webhook route needs raw body - must be registered BEFORE express.json()
app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/subscriptionController').handleWebhook
);

// Parse JSON bodies for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser for refresh tokens
app.use(cookieParser());

// Rate limiting for auth routes (20 requests per 15-minute window)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- API Routes ----
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);

// ---- 404 Handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---- Global Error Handler ----
app.use(errorHandler);

// ---- Start Server ----
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(env.port, () => {
      console.log(`[Server] Running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
