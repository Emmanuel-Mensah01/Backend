const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    phone:  { type: String, required: true, trim: true },
    topic:  { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'prayed'], default: 'new' },
  },
  { timestamps: true }
);

// CORRECT — safe against duplicates
module.exports = mongoose.models.PrayerRequest || mongoose.model('PrayerRequest', prayerRequestSchema);