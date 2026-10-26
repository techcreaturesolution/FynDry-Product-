import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { releaseStock } from '../utils/stock.js';
import { sendOrderConfirmationEmail } from '../utils/mailer.js';
import { ENV } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Idempotently handles Razorpay payment and refund webhooks
 * @access  Public (Signature-verified)
 */
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = ENV.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSignature) {
    throw new ApiError(400, 'Missing X-Razorpay-Signature header');
  }

  // Get raw body buffer from request
  const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  // Verify webhook signature (supports bypass if in mock test mode)
  const isMockSecret = webhookSecret.includes('mock') || webhookSecret.includes('placeholder');
  let isSignatureValid = false;
  try {
    isSignatureValid =
      isMockSecret ||
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(webhookSignature));
  } catch {
    isSignatureValid = false;
  }

  if (!isSignatureValid && !isMockSecret) {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  const event = req.body.event;
  const payload = req.body.payload || {};

  console.log(`[Razorpay Webhook] Received event: ${event}`);

  // 1. Handle Payment Captured
  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id || payload.order?.entity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (razorpayOrderId) {
      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      if (order && order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.razorpayPaymentId = razorpayPaymentId || order.payment.razorpayPaymentId;
        order.payment.paidAt = new Date();
        order.orderStatus = 'confirmed';

        order.statusHistory.push({
          status: 'confirmed',
          at: new Date(),
          note: `Payment confirmed via webhook (${event})`,
          by: 'razorpay_webhook',
        });

        await order.save();

        // Clear cart if source was cart
        if (order.source === 'cart') {
          await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
        }

        sendOrderConfirmationEmail(order);
      }
    }
  }

  // 2. Handle Payment Failed
  else if (event === 'payment.failed') {
    const paymentEntity = payload.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;

    if (razorpayOrderId) {
      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      if (order && order.payment.status === 'pending') {
        order.payment.status = 'failed';
        order.orderStatus = 'cancelled';
        order.cancelReason = paymentEntity?.error_description || 'Payment failed via webhook';
        order.cancelledAt = new Date();

        order.statusHistory.push({
          status: 'cancelled',
          at: new Date(),
          note: `Payment failed via webhook: ${order.cancelReason}`,
          by: 'razorpay_webhook',
        });

        await order.save();

        // Release reserved stock back
        const stockItems = order.items.map((i) => ({
          product: i.product,
          variantId: i.variantId,
          quantity: i.quantity,
        }));
        await releaseStock(stockItems);
      }
    }
  }

  // 3. Handle Refund Processed
  else if (event === 'refund.processed') {
    const refundEntity = payload.refund?.entity;
    const paymentId = refundEntity?.payment_id;

    if (paymentId) {
      const order = await Order.findOne({ 'payment.razorpayPaymentId': paymentId });
      if (order && order.payment.status !== 'refunded') {
        order.payment.status = 'refunded';
        order.payment.refundId = refundEntity?.id || order.payment.refundId;
        order.payment.refundedAt = new Date();

        order.statusHistory.push({
          status: order.orderStatus,
          at: new Date(),
          note: `Refund processed via webhook (Refund ID: ${refundEntity?.id})`,
          by: 'razorpay_webhook',
        });

        await order.save();
      }
    }
  }

  res.status(200).json({ status: 'ok', received: true });
});

export default { handleRazorpayWebhook };
