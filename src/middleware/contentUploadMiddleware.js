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

// ─── MIME type → extension map (fixes mobile uploads with no file extension) ──
const MIME_MAP = {
  'image/jpeg':       'jpg',
  'image/jpg':        'jpg',
  'image/png':        'png',
  'image/webp':       'webp',
  'image/gif':        'gif',
  'video/mp4':        'mp4',
  'video/quicktime':  'mov',
  'video/webm':       'webm',
  'video/x-msvideo':  'avi',
  'video/x-matroska': 'mkv',
  'audio/mpeg':       'mp3',
  'audio/mp4':        'm4a',
  'audio/wav':        'wav',
  'audio/wave':       'wav',
  'audio/ogg':        'ogg',
  'audio/aac':        'aac',
  'audio/webm':       'webm',
};

// ─── Get effective extension from filename OR MIME type ───────────────────────
const getExt = (file) => {
  const fromName = path.extname(file.originalname).slice(1).toLowerCase();
  return fromName || MIME_MAP[file.mimetype] || '';
};

// ─── Shared file filter ───────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const ext = getExt(file);
  if (ALL_ALLOWED.includes(ext)) return cb(null, true);
  cb(new Error(
    `File format "${ext || file.mimetype}" is not allowed. Allowed: ${ALL_ALLOWED.join(', ')}`
  ));
};

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
      const ext     = getExt(file);
      const isPhoto = ALLOWED.photo.includes(ext);

      return {
        folder:          'dream-app/content',
        resource_type:   isPhoto ? 'image' : 'video',
        // ✅ Use separate format lists — mixing them causes Cloudinary to reject uploads
        allowed_formats: isPhoto
          ? ALLOWED.photo                          // jpg, jpeg, png, webp, gif
          : [...ALLOWED.video, ...ALLOWED.audio],  // mp4, mov, mp3, m4a, wav ...
        public_id:       `content-${Date.now()}`,
      };
    },
  });

  contentUpload = multer({
    storage,
    limits:     { fileSize: 200 * 1024 * 1024 }, // 200 MB
    fileFilter,
  });

} else {
  // ── Local disk storage (fallback when Cloudinary is not configured) ────────
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
      const ext   = getExt(file);
      const fname = `content-${Date.now()}${ext ? '.' + ext : '.bin'}`;
      cb(null, fname);
    },
  });

  contentUpload = multer({
    storage,
    limits:     { fileSize: 200 * 1024 * 1024 }, // 200 MB
    fileFilter,
  });
}

module.exports = { contentUpload };