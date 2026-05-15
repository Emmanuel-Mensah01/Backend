const express = require('express');
const router = express.Router();
const { registerPastor, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register-pastor', registerPastor);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;