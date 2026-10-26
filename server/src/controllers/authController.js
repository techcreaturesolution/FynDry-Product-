import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  getRefreshTokenCookieOptions,
} from '../utils/token.js';

/**
 * @desc Helper to issue access token in body and refresh token in httpOnly cookie
 */
const sendAuthResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token in database
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Set httpOnly secure cookie
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: user.toJSON(),
      accessToken,
    },
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  // Strictly enforce customer role for registration
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    phone: phone || '',
    role: 'customer',
    isActive: true,
  });

  await sendAuthResponse(user, 201, res, 'Customer account created successfully');
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  await sendAuthResponse(user, 200, res, 'Login successful');
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate and refresh access token using httpOnly refresh token cookie
 * @access  Public (via cookie)
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token not found. Please log in again.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw new ApiError(401, 'Refresh token has expired or is invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user) {
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw new ApiError(401, 'User belonging to refresh token no longer exists.');
  }

  if (!user.isActive) {
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw new ApiError(403, 'Your account has been deactivated.');
  }

  // Verify that incoming token matches stored hash
  const incomingHash = hashToken(incomingRefreshToken);
  if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
    // Refresh token reuse detected or token revoked
    user.refreshTokenHash = null;
    await user.save({ validateBeforeSave: false });
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    throw new ApiError(401, 'Invalid or revoked refresh token. Session terminated.');
  }

  // Token Rotation: Issue new access token AND new refresh token
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: {
      accessToken: newAccessToken,
      user: user.toJSON(),
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (incomingRefreshToken) {
    const hashed = hashToken(incomingRefreshToken);
    await User.findOneAndUpdate({ refreshTokenHash: hashed }, { $set: { refreshTokenHash: null } });
  } else if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokenHash: null } });
  }

  res.clearCookie('refreshToken', {
    ...getRefreshTokenCookieOptions(),
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
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
 * @route   PATCH /api/auth/change-password
 * @desc    Change current user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password does not match.');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password cannot be identical to current password.');
  }

  user.passwordHash = newPassword;

  // Rotate tokens upon password change
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  user.refreshTokenHash = hashToken(newRefreshToken);

  await user.save();

  res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: {
      accessToken: newAccessToken,
    },
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update basic user profile (name, phone)
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (email && email.toLowerCase() !== user.email) {
    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      throw new ApiError(409, 'Email address is already in use by another account.');
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON(),
    },
  });
});

/**
 * Address Management Endpoints (Supports Phase 2 / Phase 3 checkout & profiles)
 */
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addressData = req.body;

  if (addressData.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    addressData.isDefault = true;
  }

  user.addresses.push(addressData);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: user.addresses,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: user.addresses,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const wasDefault = address.isDefault;
  user.addresses.pull({ _id: addressId });

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: user.addresses,
  });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  let found = false;
  user.addresses.forEach((addr) => {
    if (addr._id.toString() === addressId) {
      addr.isDefault = true;
      found = true;
    } else {
      addr.isDefault = false;
    }
  });

  if (!found) {
    throw new ApiError(404, 'Address not found');
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated',
    data: user.addresses,
  });
});

export default {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  changePassword,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
