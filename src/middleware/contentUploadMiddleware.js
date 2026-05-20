const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_name';

// ─── Allowed formats per media category ──────────────────────────────────────
const ALLOWED = {
  video: ['mp4', 'mov', 'webm', 'mkv', 'avi'],
  audio: ['mp3', 'm4a', 'wav', 'webm', 'ogg', 'aac', 'mp4'],
  photo: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
};

const ALL_ALLOWED = Object.values(ALLOWED).flat();

let contentUpload;

if (isCloudinaryConfigured) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const ext      = path.extname(file.originalname).slice(1).toLowerCase();
      const isVideo  = ALLOWED.video.includes(ext);
      const isAudio  = ALLOWED.audio.includes(ext);
      const isPhoto  = ALLOWED.photo.includes(ext);

      return {
        folder:        'dream-app/content',
        resource_type: isPhoto ? 'image' : 'video', // Cloudinary uses 'video' for audio too
        allowed_formats: ALL_ALLOWED,
        public_id: `content-${Date.now()}`,
      };
    },
  });

  contentUpload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB for videos
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      if (ALL_ALLOWED.includes(ext)) return cb(null, true);
      cb(new Error(`File format .${ext} is not allowed. Allowed: ${ALL_ALLOWED.join(', ')}`));
    },
  });

} else {
  // ── Local disk storage ────────────────────────────────────────────────────
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
      const ext   = path.extname(file.originalname) || '.bin';
      const fname = `content-${Date.now()}${ext}`;
      cb(null, fname);
    },
  });

  contentUpload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      if (ALL_ALLOWED.includes(ext)) return cb(null, true);
      cb(new Error(`File format .${ext} is not allowed. Allowed: ${ALL_ALLOWED.join(', ')}`));
    },
  });
}

module.exports = { contentUpload };