const Submission = require('../models/Submission');

const addInterpretation = async (req, res) => {
  const { type, textContent } = req.body;
  const submission = await Submission.findById(req.params.submissionId);

  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

  const interpretation = {
    type,
    respondedAt: new Date(),
  };

  if (type === 'text') {
    if (!textContent) return res.status(400).json({ success: false, message: 'Text interpretation is required.' });
    interpretation.textContent = textContent;
  }

  if (type === 'audio' && req.file) {
    const isCloudinaryUrl = req.file.path && req.file.path.startsWith('http');
    interpretation.audioUrl = isCloudinaryUrl
      ? req.file.path
      : `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    interpretation.audioPublicId = req.file.filename || req.file.public_id;
  }

  submission.interpretation = interpretation;
  submission.status = 'interpreted';
  await submission.save();

  res.json({ success: true, message: 'Interpretation saved.', submission });
};

const getInterpretationByReference = async (req, res) => {
  const submission = await Submission.findOne({
    paymentReference: req.params.reference,
    status: 'interpreted',
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Interpretation not ready yet or reference not found.' });
  }

  res.json({
    success: true,
    submitterName: submission.submitterName,
    status: submission.status,
    interpretation: submission.interpretation,
    submittedAt: submission.createdAt,
  });
};

module.exports = { addInterpretation, getInterpretationByReference };