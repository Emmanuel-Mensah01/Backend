const Content = require('../models/Content');
const { cloudinary } = require('../middleware/contentUploadMiddleware');

// GET /api/content — public
const getAllContent = async (req, res) => {
  const { type } = req.query;
  const filter = { isPublished: true };
  if (type) filter.type = type;

  const content = await Content.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, content });
};

// POST /api/content — pastor only
const createContent = async (req, res) => {
  const { title, description, type, duration } = req.body;

  if (!title || !type || !req.file) {
    return res.status(400).json({ success: false, message: 'Title, type and media file are required.' });
  }

  const isVideo = req.file.mimetype?.startsWith('video/');

  const content = await Content.create({
    title,
    description,
    type,
    mediaType: isVideo ? 'video' : 'audio',
    mediaUrl: req.file.path,
    mediaPublicId: req.file.filename,
    duration,
  });

  res.status(201).json({ success: true, content });
};

// DELETE /api/content/:id — pastor only
const deleteContent = async (req, res) => {
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });

  // Delete from Cloudinary
  if (content.mediaPublicId) {
    await cloudinary.uploader.destroy(content.mediaPublicId, { resource_type: 'video' });
  }

  await content.deleteOne();
  res.json({ success: true, message: 'Content deleted.' });
};

// PATCH /api/content/:id — pastor only
const updateContent = async (req, res) => {
  const { title, description, isPublished, order } = req.body;
  const content = await Content.findByIdAndUpdate(
    req.params.id,
    { title, description, isPublished, order },
    { new: true }
  );
  if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });
  res.json({ success: true, content });
};

module.exports = { getAllContent, createContent, deleteContent, updateContent };