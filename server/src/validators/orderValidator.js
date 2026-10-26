import { z } from 'zod';

export const checkoutSchema = z.object({
  source: z.enum(['cart', 'buy_now']).default('cart'),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1, 'Product ID is required'),
        variantId: z.string().trim().optional(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Max 10 per item'),
      })
    )
    .optional(),
  addressId: z.string().trim().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['razorpay', 'cod']).default('razorpay'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().trim().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().trim().min(1, 'Razorpay signature is required'),
  orderId: z.string().trim().optional(),
});

export const paymentFailedSchema = z.object({
  orderId: z.string().trim().optional(),
  razorpay_order_id: z.string().trim().optional(),
  reason: z.string().trim().optional().default('Payment cancelled or rejected by user'),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().optional().default('Cancelled by customer'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'placed',
    'confirmed',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
  ]),
  note: z.string().trim().optional().default(''),
  trackingId: z.string().trim().optional().default(''),
  courierName: z.string().trim().optional().default(''),
});
