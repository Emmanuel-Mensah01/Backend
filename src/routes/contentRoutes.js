const express = require('express');
const router = express.Router();
const { getAllContent, createContent, deleteContent, updateContent } = require('../controllers/contentController');
const { protect, pastorOnly } = require('../middleware/authMiddleware');
const { contentUpload } = require('../middleware/contentUploadMiddleware');

// Public
router.get('/', getAllContent);

// Pastor only
router.post('/', protect, pastorOnly, contentUpload.single('media'), createContent);
router.patch('/:id', protect, pastorOnly, updateContent);
router.delete('/:id', protect, pastorOnly, deleteContent);

module.exports = router;