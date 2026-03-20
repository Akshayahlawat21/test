const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  subscription: {
    plan: {
      type: String,
      enum: ['monthly', 'yearly', 'none'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'lapsed'],
      default: 'inactive',
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    renewalDate: Date,
  },
  scores: [{
    value: { type: Number, min: 1, max: 45, required: true },
    date: { type: Date, required: true },
  }],
  charity: {
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
    contributionPercent: { type: Number, min: 10, default: 10 },
  },
  refreshToken: String,
}, { timestamps: true });

// Enforce maximum 5 scores per user
userSchema.path('scores').validate(function (scores) {
  return scores.length <= 5;
}, 'Maximum 5 scores allowed');

// Exclude sensitive fields when converting to JSON
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
