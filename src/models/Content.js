const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    // 'teaching' | 'prayer'
    type: {
      type: String,
      enum: ['teaching', 'prayer'],
      required: true,
      default: 'teaching',
    },

    // 'video' | 'audio' | 'photo'
    mediaType: {
      type: String,
      enum: ['video', 'audio', 'photo'],
      required: true,
    },

    // Full URL — either Cloudinary CDN or local /uploads/ path
    mediaUrl: {
      type: String,
      required: true,
    },

    // Cloudinary public_id or local filename — used for deletion
    mediaPublicId: {
      type: String,
      default: '',
    },

    // Optional human-readable duration e.g. "12:34"
    duration: {
      type: String,
      default: '',
    },

    // Controls whether this item appears on the public MediaPage
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);