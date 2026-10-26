import Product from '../models/Product.js';

/**
 * Atomically reserves variant stock with condition stock >= quantity.
 * If any item fails, rolls back all previous items.
 * @param {Array<{ product: string, variantId: string, quantity: number }>} items
 * @returns {Promise<{ success: boolean, failedItem?: object }>}
 */
export const reserveStock = async (items = []) => {
  const reserved = [];

  for (const item of items) {
    const res = await Product.updateOne(
      {
        _id: item.product,
        'variants._id': item.variantId,
        'variants.stock': { $gte: item.quantity },
      },
      {
        $inc: { 'variants.$.stock': -item.quantity },
      }
    );

    if (res.modifiedCount === 0) {
      // Rollback previously reserved stock
      await releaseStock(reserved);
      return { success: false, failedItem: item };
    }

    reserved.push(item);
  }

  return { success: true };
};

/**
 * Atomically releases reserved stock back to product variants
 * @param {Array<{ product: string, variantId: string, quantity: number }>} items
 */
export const releaseStock = async (items = []) => {
  for (const item of items) {
    if (!item.product || !item.variantId || !item.quantity) continue;
    try {
      await Product.updateOne(
        {
          _id: item.product,
          'variants._id': item.variantId,
        },
        {
          $inc: { 'variants.$.stock': item.quantity },
        }
      );
    } catch (err) {
      console.error(
        `[Stock Release Error] Failed to release product ${item.product} variant ${item.variantId}:`,
        err.message
      );
    }
  }
};

export default { reserveStock, releaseStock };
