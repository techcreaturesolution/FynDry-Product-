import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    shippingFee: {
      type: Number,
      default: 49,
      min: [0, 'Shipping fee cannot be negative'],
    },
    freeShippingThreshold: {
      type: Number,
      default: 499,
      min: [0, 'Free shipping threshold cannot be negative'],
    },
    gstPercentage: {
      type: Number,
      default: 5,
      min: [0, 'GST percentage cannot be negative'],
      max: [100, 'GST percentage cannot exceed 100'],
    },
    isCodEnabled: {
      type: Boolean,
      default: true,
    },
    storeContact: {
      storeName: {
        type: String,
        default: 'FynDry',
        trim: true,
      },
      supportEmail: {
        type: String,
        default: 'support@fyndry.com',
        trim: true,
        lowercase: true,
      },
      supportPhone: {
        type: String,
        default: '+91 98765 43210',
        trim: true,
      },
      address: {
        type: String,
        default: 'FynDry Natural Foods Pvt. Ltd., Indiranagar, Bengaluru, Karnataka, 560038, India',
        trim: true,
      },
      gstin: {
        type: String,
        default: '29AABCF1234F1Z5',
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists (singleton pattern)
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
