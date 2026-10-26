import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  mergeGuestCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '../validators/cartValidator.js';

const router = express.Router();

router.use(protect);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart/items (and backward compatibility alias POST /api/cart/add)
router.post('/items', validate(addToCartSchema), addItemToCart);
router.post('/add', validate(addToCartSchema), addItemToCart);

// PATCH /api/cart/items/:itemId (and backward compatibility alias PUT /api/cart/items/:itemId)
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItemQuantity);
router.put('/items/:itemId', validate(updateCartItemSchema), updateCartItemQuantity);

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', removeCartItem);

// DELETE /api/cart
router.delete('/', clearCart);

// POST /api/cart/merge (and backward compatibility alias POST /api/cart/sync)
router.post('/merge', validate(mergeCartSchema), mergeGuestCart);
router.post('/sync', mergeGuestCart);

export default router;
