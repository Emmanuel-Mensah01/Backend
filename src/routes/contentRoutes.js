const express = require('express');
const router  = express.Router();

const {
  createContent,
  getAllContent,
  deleteContent,
  togglePublish,
} = require('../controllers/contentController');

const { protect, pastorOnly }    = require('../middleware/authMiddleware');
const { contentUpload }          = require('../middleware/contentUploadMiddleware');

// ─── Public ───────────────────────────────────────────────────────────────────
// GET /api/content  — MediaPage fetches all published content
router.get('/', getAllContent);

// ─── Pastor only ─────────────────────────────────────────────────────────────
// POST /api/content  — upload a new video / audio / photo
router.post(
  '/',
  protect,
  pastorOnly,
  contentUpload.single('media'),  // accepts video / audio / photo
  createContent
);

// DELETE /api/content/:id
router.delete('/:id', protect, pastorOnly, deleteContent);

// PATCH /api/content/:id/publish  — toggle visibility without deleting
router.patch('/:id/publish', protect, pastorOnly, togglePublish);

// ─── Multer error handler — catches fileFilter rejections ─────────────────────
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.message?.includes('not allowed') || err.message?.includes('format'))) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;