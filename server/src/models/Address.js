import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(?:\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''));
        },
        message: 'Please provide a valid 10-digit Indian mobile number',
      },
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 (house / flat / building) is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      default: '',
      trim: true,
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: 'Please provide a valid 6-digit Indian PIN code',
      },
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [longitude, latitude]
    },
    formattedAddress: {
      type: String,
      default: '',
      trim: true,
    },
    addedVia: {
      type: String,
      enum: ['manual', 'live_location'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: remove location if coordinates are not provided or empty
addressSchema.pre('save', function (next) {
  if (
    !this.location ||
    !Array.isArray(this.location.coordinates) ||
    this.location.coordinates.length < 2
  ) {
    this.location = undefined;
  }
  next();
});

// 2dsphere index on location coordinates for geospatial lookups
addressSchema.index({ location: '2dsphere' }, { sparse: true });

const Address = mongoose.model('Address', addressSchema);
export default Address;
