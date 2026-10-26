import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  variantId: z.string().trim().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 units per item').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(10, 'Maximum 10 units per item'),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().trim().min(1, 'Product ID is required'),
      variantId: z.string().trim().optional(),
      quantity: z.number().int().min(1).max(10).default(1),
    })
  ),
});
