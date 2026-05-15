const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_name';

let upload;

if (isCloudinaryConfigured) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

 cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000,
});

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'dream-app/audio',
      resource_type: 'video',
    allowed_formats: ['mp3', 'wav', 'webm', 'm4a', 'ogg', 'mp4', 'aac'],
    },
  });

  upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

} else {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const fname = `audio-${Date.now()}${path.extname(file.originalname) || '.webm'}`;
      cb(null, fname);
    },
  });

  upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
}

module.exports = { upload };