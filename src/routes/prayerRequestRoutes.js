const express = require('express');
const router = express.Router();
const {
  createPrayerRequest,
  getAllPrayerRequests,
  updatePrayerRequestStatus,
  deletePrayerRequest,
} = require('../controllers/prayerRequestController');
const { protect, pastorOnly } = require('../middleware/authMiddleware');

router.post('/',            createPrayerRequest);                          // public
router.get('/',             protect, pastorOnly, getAllPrayerRequests);
router.patch('/:id/status', protect, pastorOnly, updatePrayerRequestStatus);
router.delete('/:id',       protect, pastorOnly, deletePrayerRequest);

module.exports = router;