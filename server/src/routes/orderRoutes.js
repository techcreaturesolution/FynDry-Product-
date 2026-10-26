import express from 'express';
import {
  checkout,
  verifyPayment,
  paymentFailed,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkoutLimiter } from '../middleware/rateLimit.js';
import {
  checkoutSchema,
  verifyPaymentSchema,
  paymentFailedSchema,
  cancelOrderSchema,
} from '../validators/orderValidator.js';

const router = express.Router();

router.use(protect);

// Customer Checkout & Payment
router.post('/checkout', checkoutLimiter, validate(checkoutSchema), checkout);
router.post('/verify-payment', validate(verifyPaymentSchema), verifyPayment);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment); // Compatibility alias
router.post('/payment-failed', validate(paymentFailedSchema), paymentFailed);

// Customer Orders Listing & Details
router.get('/', getMyOrders);
router.get('/my', getMyOrders); // Compatibility alias
router.get('/:id', getOrderById);

// Order Cancellation
router.patch('/:id/cancel', validate(cancelOrderSchema), cancelOrder);

export default router;
