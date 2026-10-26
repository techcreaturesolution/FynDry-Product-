import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
    },
    image: {
      type: String,
      default: '',
    },
    variantLabel: {
      type: String,
      default: '100g',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const shippingAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    label: { type: String, default: 'Home' },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
    formattedAddress: { type: String, default: '' },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    paidAt: { type: Date },
    refundId: { type: String, default: '' },
    refundedAt: { type: Date },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    by: {
      type: String,
      default: 'system',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: [orderItemSnapshotSchema],
    shippingAddress: {
      type: shippingAddressSnapshotSchema,
      required: true,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['razorpay', 'cod'],
      default: 'razorpay',
    },
    payment: {
      type: paymentSchema,
      default: () => ({ status: 'pending' }),
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'placed',
        'confirmed',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'placed',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    trackingId: {
      type: String,
      default: '',
      trim: true,
    },
    courierName: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      enum: ['cart', 'buy_now'],
      default: 'cart',
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1, createdAt: -1 });

// Backward-compatibility virtual getters
orderSchema.virtual('isPaid').get(function () {
  return this.payment?.status === 'paid';
});

orderSchema.virtual('totalPrice').get(function () {
  return this.pricing?.total || 0;
});

orderSchema.virtual('itemsPrice').get(function () {
  return this.pricing?.subtotal || 0;
});

orderSchema.virtual('shippingPrice').get(function () {
  return this.pricing?.shippingFee || 0;
});

orderSchema.virtual('orderItems').get(function () {
  return this.items;
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
