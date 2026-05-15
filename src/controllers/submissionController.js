const Submission = require('../models/Submission');
const { verifyTransaction } = require('../services/paystackService');
const { MIN_OFFERING_GHS } = require('../config/constants');

const createSubmission = async (req, res) => {
  const { submitterName, submitterPhone, submitterEmail, type, textContent, paymentReference, paymentAmount } = req.body;

  if (!submitterName || !submitterPhone || !type || !paymentReference || !paymentAmount) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  if (type === 'text' && !textContent) {
    return res.status(400).json({ success: false, message: 'Text content is required for text submissions.' });
  }

  const existing = await Submission.findOne({ paymentReference });
  if (existing) {
    return res.status(400).json({ success: false, message: 'This payment reference has already been used.' });
  }

  const isDevRef = paymentReference.startsWith('DEV-');
  let verifiedAmount = Number(paymentAmount);

  if (!isDevRef) {
    const paymentData = await verifyTransaction(paymentReference);
    if (paymentData.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment could not be verified.' });
    }
    verifiedAmount = paymentData.data.amount / 100;
    if (verifiedAmount < MIN_OFFERING_GHS) {
      return res.status(400).json({ success: false, message: `Minimum offering is GHS ${MIN_OFFERING_GHS}.` });
    }
  }

  const submissionData = {
    submitterName,
    submitterPhone,
    submitterEmail,
    type,
    paymentReference,
    paymentAmount: verifiedAmount,
    paymentVerified: !isDevRef,
  };

  if (type === 'text') {
    submissionData.textContent = textContent;
  }

  if (type === 'audio' && req.file) {
    const isCloudinaryUrl = req.file.path && req.file.path.startsWith('http');
    submissionData.audioUrl = isCloudinaryUrl
      ? req.file.path
      : `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    submissionData.audioPublicId = req.file.filename || req.file.public_id;
  }

  const submission = await Submission.create(submissionData);

  res.status(201).json({
    success: true,
    message: 'Dream submitted successfully.',
    submissionId: submission._id,
  });
};

const getAllSubmissions = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const submissions = await Submission.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Submission.countDocuments(filter);
  res.json({ success: true, total, page: Number(page), submissions });
};

const getSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
  res.json({ success: true, submission });
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  const submission = await Submission.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
  res.json({ success: true, submission });
};

module.exports = { createSubmission, getAllSubmissions, getSubmission, updateStatus };