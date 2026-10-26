import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
    },
  });
});

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile (name, phone, avatar)
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  // If avatar uploaded as file or passed as url
  if (req.file) {
    user.avatar = req.file.path.startsWith('http')
      ? req.file.path
      : `/uploads/${req.file.filename}`;
  } else if (avatar !== undefined) {
    user.avatar = avatar.trim();
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON(),
    },
  });
});

export default {
  getProfile,
  updateProfile,
};
