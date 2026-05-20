// backend/models/PodcastLink.js
const mongoose = require('mongoose');

const podcastLinkSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    platform: { type: String, required: true, default: 'Other' },
    url:      { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PodcastLink', podcastLinkSchema);