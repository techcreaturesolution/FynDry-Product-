describe('Pricing & Checkout Calculation Logic Tests', () => {
  const calculateOrderPricing = (items, options = {}) => {
    const {
      freeShippingThreshold = 499,
      standardShippingFee = 49,
      gstPercentage = 5,
      discount = 0,
    } = options;

    const subtotal = items.reduce((sum, item) => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      return sum + lineTotal;
    }, 0);

    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
    const tax = Math.round((subtotal * (gstPercentage / 100)) * 100) / 100;
    const total = Math.max(0, subtotal + shippingFee + tax - discount);

    return {
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      qualifiesForFreeShipping: subtotal >= freeShippingThreshold,
    };
  };

  test('calculates correct subtotal for single item with multiple quantity', () => {
    const items = [{ name: 'Apple Slices', price: 189, quantity: 2 }];
    const pricing = calculateOrderPricing(items);

    expect(pricing.subtotal).toBe(378);
  });

  test('applies standard shipping fee (₹49) when order subtotal is below ₹499', () => {
    const items = [{ name: 'Apple Slices', price: 189, quantity: 2 }]; // 378 < 499
    const pricing = calculateOrderPricing(items);

    expect(pricing.subtotal).toBe(378);
    expect(pricing.shippingFee).toBe(49);
    expect(pricing.qualifiesForFreeShipping).toBe(false);
  });

  test('waives shipping fee (₹0) when order subtotal reaches or exceeds free shipping threshold (₹499)', () => {
    const items = [
      { name: 'Apple Slices', price: 189, quantity: 2 }, // 378
      { name: 'Banana Bites', price: 159, quantity: 1 }, // 159
    ]; // Total = 537 >= 499
    const pricing = calculateOrderPricing(items);

    expect(pricing.subtotal).toBe(537);
    expect(pricing.shippingFee).toBe(0);
    expect(pricing.qualifiesForFreeShipping).toBe(true);
  });

  test('accurately computes 5% GST tax and final rounded total', () => {
    const items = [{ name: 'Apple Slices', price: 200, quantity: 1 }];
    const pricing = calculateOrderPricing(items, {
      freeShippingThreshold: 499,
      standardShippingFee: 49,
      gstPercentage: 5,
    });

    // Subtotal: 200, Shipping: 49, Tax: 5% of 200 = 10, Total: 200 + 49 + 10 = 259
    expect(pricing.subtotal).toBe(200);
    expect(pricing.shippingFee).toBe(49);
    expect(pricing.tax).toBe(10);
    expect(pricing.total).toBe(259);
  });

  test('handles promotional discounts properly without allowing negative total', () => {
    const items = [{ name: 'Trial Pack', price: 50, quantity: 1 }];
    const pricing = calculateOrderPricing(items, { discount: 200 });

    expect(pricing.total).toBe(0); // Subtotal + shipping + tax < discount clamped to 0
  });
});
