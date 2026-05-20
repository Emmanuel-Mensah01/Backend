const mongoose = require('mongoose');

const PrayerRequestSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    phone:  { type: String, required: true, trim: true },
    topic:  { type: String, required: true, trim: true },

    // Prophet workflow
    status: {
      type:    String,
      enum:    ['pending', 'prayed', 'archived'],
      default: 'pending',
    },
    prophetNote: { type: String, default: '' }, // private note the prophet can add
  },
  { timestamps: true }
);

module.exports = mongoose.model('PrayerRequest', PrayerRequestSchema);