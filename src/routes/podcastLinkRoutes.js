// backend/routes/podcastLinkRoutes.js
const express = require('express');
const router = express.Router();
const { getLinks, createLink, deleteLink } = require('../controllers/podcastLinkController');
const { protect, pastorOnly } = require('../middleware/authMiddleware');

router.get('/',     getLinks);                          // public — frontend reads this
router.post('/',    protect, pastorOnly, createLink);   // pastor only
router.delete('/:id', protect, pastorOnly, deleteLink); // pastor only

module.exports = router;