const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true, // Format: "YYYY-MM"
  },
  status: {
    type: String,
    enum: ['pending', 'simulated', 'published', 'cancelled'],
    default: 'pending',
  },
  drawType: {
    type: String,
    enum: ['random', 'algorithmic'],
    default: 'random',
  },
  winningNumbers: [{
    type: Number,
    min: 1,
    max: 45,
  }],
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },
    fourMatch: { type: Number, default: 0 },
    threeMatch: { type: Number, default: 0 },
  },
  jackpotRolledOver: {
    type: Boolean,
    default: false,
  },
  rolloverAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  results: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchedNumbers: [{ type: Number }],
    matchCount: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['5-match', '4-match', '3-match'],
    },
    prizeAmount: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    proofImage: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
  }],
  publishedAt: {
    type: Date,
  },
  charityAllocation: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

// Unique index on month to prevent duplicate draws
drawSchema.index({ month: 1 }, { unique: true });
drawSchema.index({ status: 1 });

module.exports = mongoose.model('Draw', drawSchema);
