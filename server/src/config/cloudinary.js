import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from './env.js';
import ApiError from '../utils/ApiError.js';

// Cloudinary client configuration
const isCloudinaryConfigured = Boolean(
  ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
  });
}

// Allowed file types: jpg, jpeg, png, webp
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type '${file.mimetype}'. Only JPG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'fyndry-products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    },
  });
} else {
  // Graceful local disk storage fallback for development / offline environments
  const uploadDir = path.resolve('public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `product-${uniqueSuffix}${ext}`);
    },
  });
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for uploading up to 6 product images
export const uploadProductImages = uploadMiddleware.array('images', 6);

// Middleware for uploading a single category or product image
export const uploadSingleImage = uploadMiddleware.single('image');

/**
 * Delete image from Cloudinary or local disk
 * @param {string} publicId - Cloudinary publicId or local filename
 */
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    if (isCloudinaryConfigured && !publicId.startsWith('local-') && !publicId.includes('.')) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      // Local fallback removal
      const filename = publicId.startsWith('/uploads/')
        ? publicId.replace('/uploads/', '')
        : publicId;
      const filePath = path.resolve('public/uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error(`[Image Deletion Error] Failed to delete image (${publicId}):`, error.message);
  }
};

export { cloudinary };
export default {
  cloudinary,
  uploadMiddleware,
  uploadProductImages,
  uploadSingleImage,
  deleteCloudinaryImage,
};
