const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getAllSubmissions,
  getSubmission,
  updateStatus,
  deleteSubmission,           // ← NEW
} = require('../controllers/submissionController');
const { protect, pastorOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const Submission = require('../models/Submission');

// Phone lookup — must be BEFORE /:id routes
router.get('/find', async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required.' });

  const submission = await Submission.findOne({
    submitterPhone: phone,
    status: 'interpreted',
  }).sort({ createdAt: -1 });

  if (!submission) return res.status(404).json({ success: false, message: 'Not found.' });

  res.json({ success: true, reference: submission.paymentReference });
});

router.post('/',              upload.single('audio'), createSubmission);
router.get('/',               protect, pastorOnly, getAllSubmissions);
router.get('/:id',            protect, pastorOnly, getSubmission);
router.patch('/:id/status',   protect, pastorOnly, updateStatus);
router.delete('/:id',         protect, pastorOnly, deleteSubmission); // ← NEW

module.exports = router;