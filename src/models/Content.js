const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['teaching', 'prayer'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    mediaType: {
      type: String,
      enum: ['video', 'audio'],
      required: true,
    },
    mediaUrl: { type: String, required: true },
    mediaPublicId: { type: String },
    thumbnail: { type: String },
    duration: { type: String },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);