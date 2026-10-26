import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Address from '../models/Address.js';
import { getNextOrderNumber } from '../models/Counter.js';
import { getRazorpayInstance } from '../config/razorpay.js';
import { ENV } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculatePricing } from '../utils/pricing.js';
import { reserveStock, releaseStock } from '../utils/stock.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/mailer.js';

// ==========================================
// CUSTOMER ORDER CONTROLLERS
// ==========================================

/**
 * @route   POST /api/orders/checkout
 * @desc    Create new order (cart or buy_now), snapshot address/items, reserve stock, create Razorpay order
 * @access  Private
 */
export const checkout = asyncHandler(async (req, res) => {
  const {
    source = 'cart',
    items: rawItems,
    addressId,
    paymentMethod = 'razorpay',
  } = req.body;

  // 1. Validate & Snapshot Shipping Address
  let address = await Address.findOne({ _id: addressId, user: req.user._id });
  if (!address) {
    // Fallback: check embedded addresses on user document
    const embedded = req.user.addresses?.id(addressId);
    if (embedded) {
      address = {
        fullName: embedded.fullName,
        phone: embedded.phone,
        addressLine1: embedded.street,
        addressLine2: embedded.landmark || '',
        landmark: embedded.landmark || '',
        city: embedded.city,
        state: embedded.state,
        pincode: embedded.postalCode,
        country: embedded.country || 'India',
        label: 'Home',
        location: embedded.location || { type: 'Point', coordinates: [0, 0] },
        formattedAddress: embedded.formattedAddress || '',
      };
    }
  }

  if (!address) {
    throw new ApiError(404, 'Selected delivery address not found');
  }

  const shippingAddressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1 || address.street,
    addressLine2: address.addressLine2 || '',
    landmark: address.landmark || '',
    city: address.city,
    state: address.state,
    pincode: address.pincode || address.postalCode,
    country: address.country || 'India',
    label: address.label || 'Home',
    location: address.location?.coordinates
      ? { type: 'Point', coordinates: address.location.coordinates }
      : undefined,
    formattedAddress: address.formattedAddress || '',
  };

  // 2. Resolve Items based on source
  let checkoutItems = [];

  if (source === 'buy_now') {
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ApiError(400, 'Items array is required for Direct Buy Now checkout');
    }
    checkoutItems = rawItems;
  } else {
    // source === 'cart'
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(400, 'Your cart is empty. Add products before proceeding to checkout.');
    }
    checkoutItems = cart.items.map((i) => ({
      productId: i.product.toString(),
      variantId: i.variantId ? i.variantId.toString() : undefined,
      quantity: i.quantity,
    }));
  }

  // 3. Verify Database Product Data & Build Snapshots
  const orderItems = [];
  const stockReserveList = [];

  for (const item of checkoutItems) {
    const product = await Product.findOne({ _id: item.productId, isActive: true });
    if (!product) {
      throw new ApiError(404, `Product '${item.productId}' is unavailable or no longer active`);
    }

    let matchedVariant = null;
    if (item.variantId && product.variants?.length > 0) {
      matchedVariant = product.variants.find((v) => v._id.toString() === item.variantId.toString());
    }
    if (!matchedVariant && product.variants?.length > 0) {
      matchedVariant = product.variants[0];
    }

    if (!matchedVariant) {
      throw new ApiError(400, `Selected product variant is not available for ${product.name}`);
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    if (matchedVariant.stock < qty) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name} (${matchedVariant.label}). Only ${matchedVariant.stock} available.`
      );
    }

    orderItems.push({
      product: product._id,
      variantId: matchedVariant._id,
      name: product.name,
      image: product.images?.[0]?.url || product.image || '',
      variantLabel: matchedVariant.label || '100g',
      price: matchedVariant.price,
      quantity: qty,
      lineTotal: matchedVariant.price * qty,
    });

    stockReserveList.push({
      product: product._id,
      variantId: matchedVariant._id,
      quantity: qty,
    });
  }

  // 4. Atomically Reserve Stock
  const stockResult = await reserveStock(stockReserveList);
  if (!stockResult.success) {
    throw new ApiError(400, 'One or more items could not be reserved due to low inventory. Please refresh your cart.');
  }

  // 5. Compute Pricing Snapshot
  const pricing = calculatePricing(orderItems, shippingAddressSnapshot);

  // 6. Generate Human-Friendly Order Number (e.g. FD-2026-000123)
  const orderNumber = await getNextOrderNumber('order');

  // 7. Handle Razorpay or COD
  let razorpayOrderId = '';
  let paymentStatus = 'pending';
  let initialOrderStatus = 'placed';

  if (paymentMethod === 'razorpay') {
    const razorpay = getRazorpayInstance();
    const isMock = !ENV.RAZORPAY_KEY_ID || ENV.RAZORPAY_KEY_ID.includes('placeholder');

    if (razorpay && !isMock) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(pricing.total * 100), // In paise
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            userId: req.user._id.toString(),
            orderNumber,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        // Rollback stock reservation on gateway creation error
        await releaseStock(stockReserveList);
        throw new ApiError(502, `Razorpay Order Creation Failed: ${err.message}`);
      }
    } else {
      // Safe simulated Razorpay order ID for development
      razorpayOrderId = `order_${Date.now()}_mock_${Math.random().toString(36).substring(7)}`;
    }
  } else if (paymentMethod === 'cod') {
    if (!ENV.ENABLE_COD) {
      await releaseStock(stockReserveList);
      throw new ApiError(400, 'Cash on Delivery is currently disabled.');
    }
  }

  // 8. Create Order Document in Database
  const order = await Order.create({
    user: req.user._id,
    orderNumber,
    items: orderItems,
    shippingAddress: shippingAddressSnapshot,
    pricing,
    paymentMethod,
    payment: {
      status: paymentStatus,
      razorpayOrderId,
    },
    orderStatus: initialOrderStatus,
    statusHistory: [
      {
        status: initialOrderStatus,
        at: new Date(),
        note:
          paymentMethod === 'cod'
            ? 'Order placed with Cash on Delivery'
            : 'Order initialized, awaiting payment gateway response',
        by: 'customer',
      },
    ],
    source,
  });

  // If COD, clear cart immediately and send email
  if (paymentMethod === 'cod') {
    if (source === 'cart') {
      await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    }
    sendOrderConfirmationEmail(order, req.user.email);
  }

  res.status(201).json({
    success: true,
    message: paymentMethod === 'cod' ? 'Order placed successfully' : 'Proceed to payment',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentMethod,
      razorpayOrderId: paymentMethod === 'razorpay' ? razorpayOrderId : undefined,
      amount: Math.round(pricing.total * 100),
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      pricing: order.pricing,
      order,
    },
  });
});

/**
 * @route   POST /api/orders/verify-payment
 * @desc    Verify Razorpay HMAC SHA-256 signature, mark paid, transition to confirmed, clear cart
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const order = await Order.findOne({
    $or: [{ 'payment.razorpayOrderId': razorpay_order_id }, ...(orderId ? [{ _id: orderId }] : [])],
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, 'Order not found for this payment verification');
  }

  // Idempotency check: if already verified and marked paid, return order directly
  if (order.payment.status === 'paid') {
    return res.status(200).json({
      success: true,
      message: 'Payment already verified',
      data: order,
    });
  }

  // Verify HMAC SHA256 signature with key secret using crypto.timingSafeEqual
  const generatedSignature = crypto
    .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isMockSecret =
    !ENV.RAZORPAY_KEY_SECRET || ENV.RAZORPAY_KEY_SECRET.includes('placeholder');

  let isSignatureValid = false;
  try {
    isSignatureValid =
      isMockSecret ||
      crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(razorpay_signature));
  } catch {
    isSignatureValid = false;
  }

  if (!isSignatureValid) {
    throw new ApiError(400, 'Invalid payment signature. Verification failed.');
  }

  // Update payment status
  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = razorpay_payment_id;
  order.payment.razorpaySignature = razorpay_signature;
  order.payment.paidAt = new Date();

  // Transition order status from placed to confirmed
  order.orderStatus = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    at: new Date(),
    note: `Payment verified successfully (Payment ID: ${razorpay_payment_id})`,
    by: 'system',
  });

  await order.save();

  // Clear cart ONLY if order source was "cart"
  if (order.source === 'cart') {
    await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
  }

  // Non-blocking confirmation email
  sendOrderConfirmationEmail(order, req.user.email);

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully and order confirmed',
    data: order,
  });
});

/**
 * @route   POST /api/orders/payment-failed
 * @desc    Mark payment as failed and release reserved stock
 * @access  Private
 */
export const paymentFailed = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, reason } = req.body;

  const order = await Order.findOne({
    $or: [
      ...(orderId ? [{ _id: orderId }] : []),
      ...(razorpay_order_id ? [{ 'payment.razorpayOrderId': razorpay_order_id }] : []),
    ],
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.payment.status === 'pending') {
    order.payment.status = 'failed';
    order.orderStatus = 'cancelled';
    order.cancelReason = reason || 'Payment abandoned or failed at gateway';
    order.cancelledAt = new Date();

    order.statusHistory.push({
      status: 'cancelled',
      at: new Date(),
      note: `Payment failed: ${order.cancelReason}`,
      by: 'system',
    });

    await order.save();

    // Release stock
    const stockItems = order.items.map((i) => ({
      product: i.product,
      variantId: i.variantId,
      quantity: i.quantity,
    }));
    await releaseStock(stockItems);
  }

  res.status(200).json({
    success: true,
    message: 'Payment marked as failed and reserved stock released',
    data: order,
  });
});

/**
 * @route   GET /api/orders
 * @desc    Get customer's orders (paginated)
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: orders,
  });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details for current customer
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id, user: req.user._id }
    : { orderNumber: id, user: req.user._id };

  const order = await Order.findOne(query);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order (only allowed before shipped). Triggers Razorpay refund if paid.
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = 'Cancelled by customer' } = req.body;

  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Rule: Cancel allowed ONLY before "shipped"
  const nonCancellableStatuses = ['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
  if (nonCancellableStatuses.includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot cancel order. Orders in '${order.orderStatus}' status cannot be cancelled.`
    );
  }

  // Trigger Razorpay refund if payment was already made
  if (order.payment.status === 'paid' && order.paymentMethod === 'razorpay') {
    const razorpay = getRazorpayInstance();
    const isMock = !ENV.RAZORPAY_KEY_ID || ENV.RAZORPAY_KEY_ID.includes('placeholder');

    if (razorpay && !isMock && order.payment.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
          amount: Math.round(order.pricing.total * 100),
          notes: {
            orderNumber: order.orderNumber,
            reason,
          },
        });
        order.payment.refundId = refund.id;
      } catch (refundErr) {
        throw new ApiError(502, `Razorpay refund processing failed: ${refundErr.message}`);
      }
    } else {
      order.payment.refundId = `rfd_mock_${Date.now()}`;
    }

    order.payment.status = 'refunded';
    order.payment.refundedAt = new Date();
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason;

  order.statusHistory.push({
    status: 'cancelled',
    at: new Date(),
    note: `Order cancelled. Reason: ${reason}. ${order.payment.status === 'refunded' ? 'Refund initiated.' : ''}`,
    by: req.user.role === 'admin' ? 'admin' : 'customer',
  });

  await order.save();

  // Release reserved stock back
  const stockItems = order.items.map((i) => ({
    product: i.product,
    variantId: i.variantId,
    quantity: i.quantity,
  }));
  await releaseStock(stockItems);

  sendOrderStatusUpdateEmail(order, req.user.email, `Order cancelled: ${reason}`);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

/**
 * Cleanup job: releases stock for unpaid Razorpay orders older than 30 minutes
 */
export const cleanupUnpaidOrders = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const expiredOrders = await Order.find({
    paymentMethod: 'razorpay',
    'payment.status': 'pending',
    createdAt: { $lt: thirtyMinutesAgo },
  });

  for (const order of expiredOrders) {
    order.payment.status = 'failed';
    order.orderStatus = 'cancelled';
    order.cancelReason = 'Payment window expired (30m timeout)';
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      at: new Date(),
      note: 'Order auto-cancelled due to payment timeout (30m)',
      by: 'system_cleanup',
    });
    await order.save();

    const stockItems = order.items.map((i) => ({
      product: i.product,
      variantId: i.variantId,
      quantity: i.quantity,
    }));
    await releaseStock(stockItems);
  }

  return expiredOrders.length;
};

// ==========================================
// ADMIN ORDER CONTROLLERS
// ==========================================

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders for admin with filters, search, and pagination
 * @access  Private (Admin)
 */
export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    search,
    dateFrom,
    dateTo,
  } = req.query;

  const query = {};

  if (status) query.orderStatus = status;
  if (paymentStatus) query['payment.status'] = paymentStatus;

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { orderNumber: { $regex: term, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: term, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: term, $options: 'i' } },
      { 'shippingAddress.city': { $regex: term, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: orders,
  });
});

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get single order details for admin
 * @access  Private (Admin)
 */
export const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { orderNumber: id };
  const order = await Order.findOne(query).populate('user', 'name email phone avatar');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * Valid state transition rules
 */
const validTransitions = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Update order status with transition rules, trackingId, courierName
 * @access  Private (Admin)
 */
export const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note, trackingId, courierName } = req.body;

  const order = await Order.findById(id).populate('user', 'email name');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const currentStatus = order.orderStatus;
  const allowedNext = validTransitions[currentStatus] || [];

  if (currentStatus !== status && !allowedNext.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition from '${currentStatus}' to '${status}'. Allowed transitions: [${allowedNext.join(', ')}]`
    );
  }

  // Update tracking details if shipping
  if (trackingId) order.trackingId = trackingId.trim();
  if (courierName) order.courierName = courierName.trim();

  // If status is moving to cancelled, release stock and trigger refund if paid
  if (status === 'cancelled' && currentStatus !== 'cancelled') {
    if (order.payment.status === 'paid' && order.paymentMethod === 'razorpay') {
      order.payment.status = 'refunded';
      order.payment.refundedAt = new Date();
    }
    const stockItems = order.items.map((i) => ({
      product: i.product,
      variantId: i.variantId,
      quantity: i.quantity,
    }));
    await releaseStock(stockItems);
    order.cancelledAt = new Date();
    order.cancelReason = note || 'Cancelled by admin';
  }

  order.orderStatus = status;
  order.statusHistory.push({
    status,
    at: new Date(),
    note: note || `Status updated to ${status}`,
    by: req.user.name || 'admin',
  });

  await order.save();

  // Send non-blocking update email
  sendOrderStatusUpdateEmail(order, order.user?.email, note);

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});

export default {
  checkout,
  verifyPayment,
  paymentFailed,
  getMyOrders,
  getOrderById,
  cancelOrder,
  cleanupUnpaidOrders,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
};
