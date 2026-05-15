const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    submitterName: { type: String, required: true, trim: true },
    submitterPhone: { type: String, required: true, trim: true },
    submitterEmail: { type: String, trim: true, lowercase: true },

    type: { type: String, enum: ['audio', 'text'], required: true },
    textContent: { type: String },
    audioUrl: { type: String },
    audioPublicId: { type: String },

    paymentReference: { type: String, required: true, unique: true },
    paymentAmount: { type: Number, required: true },
    paymentVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['pending', 'in_review', 'interpreted'],
      default: 'pending',
    },

    interpretation: {
      type: { type: String, enum: ['audio', 'text'] },
      textContent: { type: String },
      audioUrl: { type: String },
      audioPublicId: { type: String },
      respondedAt: { type: Date },
    },

    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);