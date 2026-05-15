const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: isVideo ? 'dream-app/teachings' : 'dream-app/prayers',
      resource_type: isVideo ? 'video' : 'video', // Cloudinary uses 'video' for both
      allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mp3', 'wav', 'm4a'],
    };
  },
});

const contentUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max for videos
});

module.exports = { contentUpload, cloudinary };