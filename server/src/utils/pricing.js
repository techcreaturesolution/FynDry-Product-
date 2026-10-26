import { ENV } from '../config/env.js';

/**
 * Calculates order and cart pricing breakdown
 * @param {Array} items - Array of items with { price, quantity }
 * @param {Object} [address=null] - Optional delivery address for future regional rates
 * @returns {Object} { subtotal, shippingFee, tax, discount, total, isFreeShipping, freeShippingThreshold, amountToFreeShipping }
 */
export const calculatePricing = (items = [], address = null) => {
  const freeShippingThreshold = Number(ENV.FREE_SHIPPING_THRESHOLD) || 499;
  const flatShippingFee = Number(ENV.FLAT_SHIPPING_FEE) || 49;
  const gstPercent = Number(ENV.GST_PERCENT) || 0;

  // Calculate subtotal
  const subtotal = items.reduce((acc, item) => {
    const itemPrice = Number(item.price ?? item.variant?.price ?? item.product?.price ?? 0);
    const quantity = Number(item.quantity) || 1;
    return acc + itemPrice * quantity;
  }, 0);

  // Calculate shipping fee
  let shippingFee = 0;
  if (subtotal > 0) {
    shippingFee = subtotal >= freeShippingThreshold ? 0 : flatShippingFee;
  }

  // Calculate tax (GST)
  const tax = Math.round((subtotal * gstPercent) / 100);

  // Discount (default 0, can be expanded for promo codes)
  const discount = 0;

  // Final Total
  const total = Math.max(0, subtotal + shippingFee + tax - discount);

  return {
    subtotal,
    shippingFee,
    tax,
    discount,
    total,
    isFreeShipping: subtotal >= freeShippingThreshold,
    freeShippingThreshold,
    amountToFreeShipping: subtotal > 0 && subtotal < freeShippingThreshold ? freeShippingThreshold - subtotal : 0,
    currency: 'INR',
  };
};

export default calculatePricing;
