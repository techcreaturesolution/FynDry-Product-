import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculatePricing } from '../utils/pricing.js';

/**
 * Format cart document, check for stock/price changes, and attach pricing summary
 */
const formatCartResponse = async (cart) => {
  await cart.populate({
    path: 'items.product',
    select: 'name slug price originalPrice stock image images variants accentColor isActive',
  });

  const formattedItems = [];
  let cartHasChanges = false;

  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      cartHasChanges = true;
      continue; // Filter out removed or deactivated products
    }

    // Resolve variant
    let matchedVariant = null;
    if (item.variantId && Array.isArray(item.product.variants)) {
      matchedVariant = item.product.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
    }

    if (!matchedVariant && Array.isArray(item.product.variants) && item.product.variants.length > 0) {
      matchedVariant = item.product.variants[0];
      item.variantId = matchedVariant._id;
      cartHasChanges = true;
    }

    const currentPrice = matchedVariant ? matchedVariant.price : (item.product.price || 0);
    const availableStock = matchedVariant ? matchedVariant.stock : (item.product.stock || 0);

    // Flags for price changes and out of stock
    const isOutOfStock = availableStock <= 0;
    const priceChanged = Boolean(item.savedPrice && item.savedPrice !== currentPrice);
    const previousPrice = priceChanged ? item.savedPrice : currentPrice;

    // Cap quantity if it exceeds stock
    let finalQuantity = item.quantity;
    if (availableStock > 0 && finalQuantity > availableStock) {
      finalQuantity = availableStock;
      item.quantity = finalQuantity;
      cartHasChanges = true;
    }

    const lineTotal = isOutOfStock ? 0 : currentPrice * finalQuantity;

    formattedItems.push({
      _id: item._id,
      product: {
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images?.[0]?.url || item.product.image || '',
        accentColor: item.product.accentColor,
        isActive: item.product.isActive,
      },
      variant: matchedVariant
        ? {
            _id: matchedVariant._id,
            label: matchedVariant.label,
            price: matchedVariant.price,
            mrp: matchedVariant.mrp,
            stock: matchedVariant.stock,
            sku: matchedVariant.sku,
          }
        : null,
      quantity: finalQuantity,
      price: currentPrice,
      lineTotal,
      isOutOfStock,
      availableStock,
      priceChanged,
      previousPrice,
    });
  }

  if (cartHasChanges) {
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);
    await cart.save();
  }

  // Calculate pricing breakdown via pricing utility
  const pricing = calculatePricing(
    formattedItems.filter((i) => !i.isOutOfStock)
  );

  const totalCount = formattedItems
    .filter((i) => !i.isOutOfStock)
    .reduce((sum, item) => sum + item.quantity, 0);

  return {
    _id: cart._id,
    items: formattedItems,
    totalCount,
    pricing,
    subtotal: pricing.subtotal,
    shippingFee: pricing.shippingFee,
    tax: pricing.tax,
    total: pricing.total,
  };
};

/**
 * @route   GET /api/cart
 * @desc    Get cart for current user with price and stock checks
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const formattedCart = await formatCartResponse(cart);

  res.status(200).json({
    success: true,
    data: formattedCart,
  });
});

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart or increment existing variant quantity (capped at 10 and available stock)
 * @access  Private
 */
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const numQuantity = Math.max(1, Number(quantity));

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, 'Product not found or inactive');
  }

  let matchedVariant = null;
  if (variantId && product.variants?.length > 0) {
    matchedVariant = product.variants.find((v) => v._id.toString() === variantId.toString());
  }
  if (!matchedVariant && product.variants?.length > 0) {
    matchedVariant = product.variants[0];
  }

  const availableStock = matchedVariant ? matchedVariant.stock : (product.stock || 0);
  const currentPrice = matchedVariant ? matchedVariant.price : (product.price || 0);

  if (availableStock <= 0) {
    throw new ApiError(400, 'This product or selected variant is currently out of stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if product with this variant already exists in cart
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (matchedVariant ? item.variantId?.toString() === matchedVariant._id.toString() : true)
  );

  if (itemIndex > -1) {
    const desiredQuantity = cart.items[itemIndex].quantity + numQuantity;
    // Cap at 10 and available stock
    const cappedQuantity = Math.min(10, availableStock, desiredQuantity);
    cart.items[itemIndex].quantity = cappedQuantity;
    cart.items[itemIndex].savedPrice = currentPrice;
  } else {
    const cappedQuantity = Math.min(10, availableStock, numQuantity);
    cart.items.push({
      product: productId,
      variantId: matchedVariant ? matchedVariant._id : undefined,
      quantity: cappedQuantity,
      savedPrice: currentPrice,
    });
  }

  await cart.save();
  const formattedCart = await formatCartResponse(cart);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: formattedCart,
  });
});

/**
 * @route   PATCH /api/cart/items/:itemId
 * @desc    Update quantity of specific cart item (or remove if 0)
 * @access  Private
 */
export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const numQuantity = Number(quantity);

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Support lookup by item _id or by productId for backward compatibility
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId || item.product.toString() === itemId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  if (numQuantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const targetItem = cart.items[itemIndex];
    const product = await Product.findById(targetItem.product);

    if (product) {
      let variant = null;
      if (targetItem.variantId && product.variants) {
        variant = product.variants.find((v) => v._id.toString() === targetItem.variantId.toString());
      }
      const stock = variant ? variant.stock : product.stock;
      cart.items[itemIndex].quantity = Math.min(10, stock, numQuantity);
    } else {
      cart.items[itemIndex].quantity = Math.min(10, numQuantity);
    }
  }

  await cart.save();
  const formattedCart = await formatCartResponse(cart);

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    data: formattedCart,
  });
});

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove an item from cart
 * @access  Private
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== itemId && item.product.toString() !== itemId
  );

  await cart.save();
  const formattedCart = await formatCartResponse(cart);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: formattedCart,
  });
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear all items in cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      items: [],
      totalCount: 0,
      subtotal: 0,
      total: 0,
    },
  });
});

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart items from localStorage after login
 * @access  Private
 */
export const mergeGuestCart = asyncHandler(async (req, res) => {
  const { items = [] } = req.body; // [{ productId, variantId, quantity }]

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  for (const guestItem of items) {
    if (!guestItem.productId) continue;

    const product = await Product.findOne({ _id: guestItem.productId, isActive: true });
    if (!product) continue;

    let variant = null;
    if (guestItem.variantId && product.variants?.length > 0) {
      variant = product.variants.find((v) => v._id.toString() === guestItem.variantId.toString());
    }
    if (!variant && product.variants?.length > 0) {
      variant = product.variants[0];
    }

    const availableStock = variant ? variant.stock : (product.stock || 0);
    if (availableStock <= 0) continue;

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === guestItem.productId &&
        (variant ? item.variantId?.toString() === variant._id.toString() : true)
    );

    const qtyToAdd = Number(guestItem.quantity) || 1;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = Math.min(
        10,
        availableStock,
        cart.items[existingIndex].quantity + qtyToAdd
      );
    } else {
      cart.items.push({
        product: guestItem.productId,
        variantId: variant ? variant._id : undefined,
        quantity: Math.min(10, availableStock, qtyToAdd),
        savedPrice: variant ? variant.price : product.price,
      });
    }
  }

  await cart.save();
  const formattedCart = await formatCartResponse(cart);

  res.status(200).json({
    success: true,
    message: 'Cart merged successfully',
    data: formattedCart,
  });
});

export default {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  mergeGuestCart,
};
