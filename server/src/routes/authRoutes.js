import express from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  changePassword,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  addressSchema,
} from '../validators/authValidator.js';

const router = express.Router();

// Public auth routes with rate limiting and validation
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Protected routes requiring authentication
router.get('/me', protect, getMe);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

// User address management
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.put('/addresses/:addressId', protect, validate(addressSchema), updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);

export default router;
