const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  events: [{
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
  }],
  totalReceived: {
    type: Number,
    default: 0,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Index for common queries
charitySchema.index({ active: 1, featured: -1 });

module.exports = mongoose.model('Charity', charitySchema);
