const express = require('express');
const router = express.Router();
const { addInterpretation, getInterpretationByReference } = require('../controllers/interpretationController');
const { protect, pastorOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/:submissionId', protect, pastorOnly, upload.single('audio'), addInterpretation);
router.get('/check/:reference', getInterpretationByReference);

module.exports = router;