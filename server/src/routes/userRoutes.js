import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingleImage } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', uploadSingleImage, updateProfile);

export default router;
