const Content = require('../models/Content');

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_name';

// ─── Helper: resolve the public URL for an uploaded file ─────────────────────
const resolveMediaUrl = (file) => {
  if (!file) return '';

  // Cloudinary returns a full https URL in file.path
  if (file.path && file.path.startsWith('http')) return file.path;

  // Local disk — build URL from BACKEND_URL env + filename
  const base = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${base}/uploads/${file.filename}`;
};

// ─── Helper: extract public_id / filename for later deletion ─────────────────
const resolvePublicId = (file) => {
  if (!file) return '';
  // Cloudinary stores public_id in file.filename or file.public_id
  return file.public_id || file.filename || '';
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/content
// Pastor uploads a new piece of content (video / audio / photo)
// ─────────────────────────────────────────────────────────────────────────────
const createContent = async (req, res) => {
  try {
    const { title, description, type, mediaType, duration } = req.body;

    if (!title || !type || !mediaType) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, and mediaType are required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a media file.',
      });
    }

    const content = await Content.create({
      title:        title.trim(),
      description:  description?.trim() || '',
      type,
      mediaType,
      duration:     duration?.trim() || '',
      mediaUrl:     resolveMediaUrl(req.file),
      mediaPublicId: resolvePublicId(req.file),
      isPublished:  true,
    });

    return res.status(201).json({
      success: true,
      message: 'Content uploaded successfully.',
      content,
    });
  } catch (err) {
    console.error('[createContent]', err);
    return res.status(500).json({ success: false, message: 'Server error during upload.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/content
// Public — returns all published content for the MediaPage
// Optional query: ?type=teaching|prayer  &  ?mediaType=video|audio|photo
// ─────────────────────────────────────────────────────────────────────────────
const getAllContent = async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.type)      filter.type      = req.query.type;
    if (req.query.mediaType) filter.mediaType = req.query.mediaType;

    const content = await Content.find(filter).sort({ createdAt: -1 });

    return res.json({ success: true, content });
  } catch (err) {
    console.error('[getAllContent]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/content/:id
// Pastor deletes a content item
// Also removes the file from Cloudinary if configured
// ─────────────────────────────────────────────────────────────────────────────
const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    // Attempt to delete from Cloudinary if we have a public_id
    if (isCloudinaryConfigured && content.mediaPublicId) {
      try {
        const cloudinary = require('cloudinary').v2;
        // Cloudinary resource_type depends on mediaType
        const resourceType = content.mediaType === 'photo' ? 'image' : 'video';
        await cloudinary.uploader.destroy(content.mediaPublicId, { resource_type: resourceType });
      } catch (cloudErr) {
        // Non-fatal — log but continue with DB deletion
        console.warn('[deleteContent] Cloudinary deletion failed:', cloudErr.message);
      }
    }

    await content.deleteOne();

    return res.json({ success: true, message: 'Content deleted.' });
  } catch (err) {
    console.error('[deleteContent]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/content/:id/publish
// Pastor toggles isPublished (hide/show on MediaPage without deleting)
// ─────────────────────────────────────────────────────────────────────────────
const togglePublish = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }
    content.isPublished = !content.isPublished;
    await content.save();
    return res.json({
      success: true,
      message: `Content ${content.isPublished ? 'published' : 'hidden'}.`,
      isPublished: content.isPublished,
    });
  } catch (err) {
    console.error('[togglePublish]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createContent, getAllContent, deleteContent, togglePublish };