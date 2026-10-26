import app from '../app.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ENV } from '../config/env.js';
import http from 'http';

const runTests = async () => {
  console.log('--- Starting FynDry Server API Integration Test Suite ---');

  await connectDB();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(5001, resolve));
  const BASE_URL = 'http://127.0.0.1:5001/api';
  console.log(`[Test Server] Running on ${BASE_URL}`);

  let customerToken = '';
  let adminToken = '';
  let sampleProductId = '';
  let sampleProductPrice = 0;
  let testOrderId = '';

  const request = async (url, options = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.token && { Authorization: `Bearer ${options.token}` }),
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, headers: res.headers, data };
  };

  try {
    // 1. Healthcheck
    console.log('\n1. Testing Healthcheck endpoint...');
    const health = await request('/health');
    console.assert(health.status === 200, `Health status was ${health.status}`);
    console.assert(health.data.success === true, 'Health success was not true');
    console.log('   ✓ Health check passed:', health.data.message);

    // 2. Products List
    console.log('\n2. Testing GET /products...');
    const productsRes = await request('/products');
    console.assert(productsRes.status === 200, 'Products status failed');
    console.assert(productsRes.data.data.products.length >= 6, 'Should have 6 products');
    sampleProductId = productsRes.data.data.products[0]._id;
    sampleProductPrice = productsRes.data.data.products[0].price;
    console.log(`   ✓ Found ${productsRes.data.data.products.length} products. Sample: ${productsRes.data.data.products[0].name} (₹${sampleProductPrice})`);

    // 3. Categories
    console.log('\n3. Testing GET /products/categories...');
    const catsRes = await request('/products/categories');
    console.assert(catsRes.status === 200, 'Categories status failed');
    console.log(`   ✓ Found ${catsRes.data.data.length} categories:`, catsRes.data.data.map(c => `${c.label} (${c.count})`).join(', '));

    // 4. Customer Login
    console.log('\n4. Testing POST /auth/login (Customer)...');
    const custLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@fyndry.com',
        password: 'CustomerPassword123!',
      }),
    });
    console.assert(custLogin.status === 200, 'Customer login failed');
    customerToken = custLogin.data.data.accessToken;
    console.assert(!!customerToken, 'No access token returned');
    console.log(`   ✓ Customer logged in. Name: ${custLogin.data.data.user.name}, Token length: ${customerToken.length}`);

    // 5. Saved Addresses with Geolocation Lat/Lng
    console.log('\n5. Testing Address Management with Geolocation...');
    const addAddressRes = await request('/auth/addresses', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({
        fullName: 'Radhe Sharma (Vacation Home)',
        phone: '9876543210',
        street: 'Villa 12, Palm Groves, Alibaug',
        city: 'Alibaug',
        state: 'Maharashtra',
        postalCode: '402201',
        country: 'India',
        isDefault: false,
        location: {
          type: 'Point',
          coordinates: [72.8765, 18.6414], // [lng, lat]
        },
        formattedAddress: 'Villa 12, Palm Groves, Alibaug, Maharashtra 402201',
      }),
    });
    console.assert(addAddressRes.status === 201, 'Address creation failed');
    const createdAddresses = addAddressRes.data.data;
    const addedAddress = createdAddresses[createdAddresses.length - 1];
    console.log(`   ✓ Address created with GPS: [${addedAddress.location.coordinates.join(', ')}]`);

    // 6. Cart Flow
    console.log('\n6. Testing Cart Add & Get...');
    const addToCartRes = await request('/cart/add', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({
        productId: sampleProductId,
        quantity: 2,
      }),
    });
    console.assert(addToCartRes.status === 200, 'Add to cart failed');
    console.log(`   ✓ Added item to cart. Total cart count: ${addToCartRes.data.data.totalCount}, Subtotal: ₹${addToCartRes.data.data.subtotal}`);

    // 7. Order Checkout with Server-Calculated Price
    console.log('\n7. Testing Order Creation (Buy Now direct flow)...');
    const checkoutRes = await request('/orders/checkout', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({
        items: [{ productId: sampleProductId, quantity: 2 }],
        addressId: addedAddress._id,
        paymentMethod: 'razorpay',
      }),
    });
    console.assert(checkoutRes.status === 201, 'Checkout failed');
    const orderData = checkoutRes.data.data.order;
    testOrderId = orderData._id;
    const expectedItemsPrice = sampleProductPrice * 2;
    console.assert(orderData.itemsPrice === expectedItemsPrice, `Server items price mismatch: expected ${expectedItemsPrice}, got ${orderData.itemsPrice}`);
    console.log(`   ✓ Order created: #${orderData.orderNumber}, Items Price: ₹${orderData.itemsPrice}, Grand Total: ₹${orderData.totalPrice}`);

    // 8. Payment Verification
    console.log('\n8. Testing Razorpay Payment Verification...');
    const verifyRes = await request('/orders/verify', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({
        orderId: testOrderId,
        razorpay_order_id: checkoutRes.data.data.razorpayOrder?.id || 'rzp_order_mock_test',
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'sig_test_mock',
      }),
    });
    console.assert(verifyRes.status === 200, 'Payment verification failed');
    console.assert(verifyRes.data.data.isPaid === true, 'Order was not marked paid');
    console.log(`   ✓ Payment verified. Order status updated to: ${verifyRes.data.data.orderStatus}`);

    // 9. Admin Login & Dashboard Metrics
    console.log('\n9. Testing Admin Login and Dashboard Metrics...');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@fyndry.com',
        password: 'AdminPassword123!',
      }),
    });
    console.assert(adminLogin.status === 200, 'Admin login failed');
    adminToken = adminLogin.data.data.accessToken;

    const statsRes = await request('/admin/stats', { token: adminToken });
    console.assert(statsRes.status === 200, 'Admin stats failed');
    console.log(`   ✓ Dashboard Metrics: Total Sales: ₹${statsRes.data.data.totalSales}, Total Orders: ${statsRes.data.data.totalOrders}, Active Products: ${statsRes.data.data.totalProducts}`);

    // 10. Admin Update Order Status
    console.log('\n10. Testing Admin Update Order Status...');
    const statusUpdateRes = await request(`/admin/orders/${testOrderId}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: JSON.stringify({ status: 'Shipped' }),
    });
    console.assert(statusUpdateRes.status === 200, 'Status update failed');
    console.log(`   ✓ Order #${orderData.orderNumber} status changed to 'Shipped' by Admin.`);

    console.log('\n======================================================');
    console.log('🎉 ALL 10 SERVER INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runTests();
