/**
 * MongoDB connection with retry logic and event listeners.
 */
const mongoose = require('mongoose');
const env = require('./env');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.mongoUri);
      console.log(`[DB] Connected to MongoDB (${env.isDev ? 'development' : 'production'})`);
      break;
    } catch (err) {
      retries++;
      console.error(`[DB] Connection attempt ${retries}/${MAX_RETRIES} failed: ${err.message}`);

      if (retries === MAX_RETRIES) {
        console.error('[DB] Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`[DB] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('[DB] Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[DB] Connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
