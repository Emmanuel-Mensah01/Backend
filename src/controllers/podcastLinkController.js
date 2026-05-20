// backend/controllers/podcastLinkController.js
const PodcastLink = require('../models/PodcastLink');

// GET /api/podcast-links
const getLinks = async (req, res) => {
  const links = await PodcastLink.find().sort({ createdAt: -1 });
  res.json({ success: true, links });
};

// POST /api/podcast-links
const createLink = async (req, res) => {
  const { title, platform, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ success: false, message: 'Title and URL are required.' });
  }
  const link = await PodcastLink.create({ title, platform, url });
  res.status(201).json({ success: true, link });
};

// DELETE /api/podcast-links/:id
const deleteLink = async (req, res) => {
  const link = await PodcastLink.findByIdAndDelete(req.params.id);
  if (!link) return res.status(404).json({ success: false, message: 'Link not found.' });
  res.json({ success: true, message: 'Deleted.' });
};

module.exports = { getLinks, createLink, deleteLink };