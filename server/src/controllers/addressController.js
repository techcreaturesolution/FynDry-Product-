import Address from '../models/Address.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { reverseGeocode } from '../utils/geo.js';

/**
 * Synchronize address changes to the User embedded addresses array for backward compatibility
 */
const syncUserAddresses = async (userId) => {
  try {
    const allAddresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    await User.findByIdAndUpdate(userId, {
      $set: {
        addresses: allAddresses.map((a) => ({
          _id: a._id,
          fullName: a.fullName,
          phone: a.phone,
          street: `${a.addressLine1}${a.addressLine2 ? ', ' + a.addressLine2 : ''}`,
          landmark: a.landmark || '',
          city: a.city,
          state: a.state,
          postalCode: a.pincode,
          country: a.country || 'India',
          isDefault: a.isDefault,
          location: a.location || { type: 'Point', coordinates: [0, 0] },
          formattedAddress: a.formattedAddress || '',
        })),
      },
    });
  } catch (err) {
    console.error('[Sync Addresses Warning] Failed to sync user sub-array:', err.message);
  }
};

/**
 * @route   GET /api/addresses
 * @desc    Get all saved addresses for current user
 * @access  Private
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: addresses.length,
    data: addresses,
  });
});

/**
 * @route   POST /api/addresses
 * @desc    Create a new address
 * @access  Private
 */
export const createAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Rule 1: Maximum 10 addresses per user
  const count = await Address.countDocuments({ user: userId });
  if (count >= 10) {
    throw new ApiError(400, 'Maximum limit of 10 saved addresses reached. Please remove an existing address first.');
  }

  const addressData = { ...req.body, user: userId };

  if (
    !addressData.location ||
    !Array.isArray(addressData.location.coordinates) ||
    addressData.location.coordinates.length < 2
  ) {
    delete addressData.location;
  }

  // Rule 2: Exactly one default address
  // Auto-set first address as default; if user marks this one as default, unset existing defaults
  if (count === 0 || addressData.isDefault) {
    addressData.isDefault = true;
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  const newAddress = await Address.create(addressData);
  await syncUserAddresses(userId);

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: newAddress,
  });
});

/**
 * @route   PATCH /api/addresses/:id
 * @desc    Update an existing address
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const address = await Address.findOne({ _id: id, user: userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const updates = { ...req.body };

  // Rule 3: If setting this address to default, unset others
  if (updates.isDefault === true) {
    await Address.updateMany({ user: userId, _id: { $ne: id } }, { $set: { isDefault: false } });
  } else if (updates.isDefault === false && address.isDefault) {
    // Cannot un-default if no other default exists and multiple addresses exist
    const otherAddress = await Address.findOne({ user: userId, _id: { $ne: id } });
    if (otherAddress) {
      otherAddress.isDefault = true;
      await otherAddress.save();
    } else {
      // If it's the only address, it must remain default
      updates.isDefault = true;
    }
  }

  Object.assign(address, updates);
  await address.save();
  await syncUserAddresses(userId);

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: address,
  });
});

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete an address
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const address = await Address.findOne({ _id: id, user: userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const wasDefault = address.isDefault;
  await address.deleteOne();

  // Rule 4: Cannot leave user with zero default if addresses still exist
  if (wasDefault) {
    const remainingAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
    if (remainingAddress) {
      remainingAddress.isDefault = true;
      await remainingAddress.save();
    }
  }

  await syncUserAddresses(userId);

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: null,
  });
});

/**
 * @route   PATCH /api/addresses/:id/default
 * @desc    Set an address as default and unset all others
 * @access  Private
 */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const address = await Address.findOne({ _id: id, user: userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  // Atomically unset all other defaults and set this one
  await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  address.isDefault = true;
  await address.save();
  await syncUserAddresses(userId);

  res.status(200).json({
    success: true,
    message: 'Default address updated',
    data: address,
  });
});

/**
 * @route   POST /api/geo/reverse
 * @desc    Reverse geocode coordinates to structured address
 * @access  Private (or Public)
 */
export const reverseGeocodeAddress = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  const structuredAddress = await reverseGeocode(lat, lng);

  res.status(200).json({
    success: true,
    data: {
      addressLine2: structuredAddress.addressLine2,
      city: structuredAddress.city,
      state: structuredAddress.state,
      pincode: structuredAddress.pincode,
      formattedAddress: structuredAddress.formattedAddress,
    },
  });
});

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  reverseGeocodeAddress,
};
