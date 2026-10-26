import { test, expect } from '@playwright/test';

test.describe('FynDry Complete End-to-End Customer Purchase Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test Shopper ${timestamp}`,
    email: `shopper_${timestamp}@example.com`,
    password: 'Password@1234',
    phone: '9876543210',
  };

  test('Full Journey: Register -> Add to Cart -> Add Shipping Address -> Razorpay / COD Order -> Order Details Visible', async ({
    page,
  }) => {
    // 1. Visit Storefront
    await page.goto('/');
    await expect(page).toHaveTitle(/FynDry/i);

    // 2. Register New Customer
    await page.goto('/register');
    await page.fill('input[placeholder*="Name" i], input[name="name"]', testUser.name);
    await page.fill('input[type="email"], input[name="email"]', testUser.email);
    await page.fill('input[type="password"], input[name="password"]', testUser.password);
    if (await page.locator('input[name="phone"]').isVisible()) {
      await page.fill('input[name="phone"]', testUser.phone);
    }
    await page.click('button[type="submit"]:has-text("Register"), button[type="submit"]:has-text("Create")');

    // Wait for redirect to /shop or home
    await page.waitForURL(/\/(shop|\?|account|$)/);

    // 3. Browse Shop Catalog
    await page.goto('/shop');
    await page.waitForSelector('text=₹');

    // Click on the first product card
    const firstProduct = page.locator('a[href*="/product/"]').first();
    await firstProduct.click();

    // 4. Product Detail Page
    await page.waitForURL(/\/product\/.+/);
    await expect(page.locator('h1')).toBeVisible();

    // Select variant (e.g. 100g or 250g) and Add to Cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await addToCartBtn.click();

    // Open Cart or Navigate to Checkout
    await page.goto('/checkout');
    await page.waitForURL('/checkout');

    // 5. Add or Select Shipping Address
    const addressFormVisible = await page.locator('input[name="addressLine1"], input[placeholder*="Flat" i]').isVisible();
    if (addressFormVisible) {
      await page.fill('input[name="fullName"]', testUser.name);
      await page.fill('input[name="phone"]', testUser.phone);
      await page.fill('input[name="addressLine1"]', 'Flat 402, Lotus Blossom Residency');
      await page.fill('input[name="addressLine2"]', 'College Road');
      await page.fill('input[name="city"]', 'Nashik');
      await page.fill('input[name="pincode"]', '422005');
      if (await page.locator('select[name="state"]').isVisible()) {
        await page.selectOption('select[name="state"]', 'Maharashtra');
      }
      const saveAddrBtn = page.locator('button:has-text("Save"), button:has-text("Deliver to this address")').first();
      if (await saveAddrBtn.isVisible()) {
        await saveAddrBtn.click();
      }
    }

    // 6. Select Payment Method (Cash on Delivery or Razorpay Test Mode)
    const codOption = page.locator('input[value="cod"], label:has-text("Cash on Delivery")');
    if (await codOption.isVisible()) {
      await codOption.click();
    }

    // 7. Place Order
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Pay")').first();
    await placeOrderBtn.click();

    // 8. Verify Order Success Page
    await page.waitForURL(/\/order-success\/.+/, { timeout: 15000 });
    await expect(page.locator('text=Order Placed Successfully, text=Order Confirmed')).toBeVisible();

    // 9. Verify Order is Visible in Customer Account Orders List
    await page.goto('/account/orders');
    await expect(page.locator('text=FD-2026-, text=Order')).toBeVisible();
  });
});
