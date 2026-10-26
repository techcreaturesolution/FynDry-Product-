import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_mock';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_mock';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fyndry.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@FynDry';

function request({ path, method = 'GET', body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(`   FynDry Phase 4 Orders & Razorpay Verification    `);
  console.log(`   Target Server: ${BASE_URL}                       `);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    // 0. Setup: Authenticate Admin & Register Customer
    const adminLoginRes = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });

    assert(
      adminLoginRes.statusCode === 200 && !!adminLoginRes.data?.data?.accessToken,
      'Admin logged in for Phase 4 verification',
      JSON.stringify(adminLoginRes.data)
    );
    const adminToken = adminLoginRes.data?.data?.accessToken;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const testEmail = `phase4_cust_${Date.now()}@fyndry.test`;
    const regRes = await request({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Phase 4 Buyer',
        email: testEmail,
        password: 'CustomerPassword123!',
        phone: '9811223344',
      },
    });

    assert(
      regRes.statusCode === 201 && !!regRes.data?.data?.accessToken,
      'Customer registered for Phase 4 tests',
      JSON.stringify(regRes.data)
    );
    const customerToken = regRes.data?.data?.accessToken;
    const customerHeaders = { Authorization: `Bearer ${customerToken}` };

    // 1. Create a customer address
    const addrRes = await request({
      path: '/api/addresses',
      method: 'POST',
      headers: customerHeaders,
      body: {
        fullName: 'Phase 4 Buyer',
        phone: '9811223344',
        addressLine1: 'Villa 101, Palm Meadows',
        addressLine2: 'Whitefield',
        landmark: 'Near Forum Mall',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        country: 'India',
        label: 'Home',
        isDefault: true,
        location: {
          type: 'Point',
          coordinates: [77.7499, 12.9698],
        },
      },
    });

    const addressId = addrRes.data?.data?._id || addrRes.data?.data?.address?._id;
    assert(
      addrRes.statusCode === 201 && !!addressId,
      'Saved customer shipping address with lat/lng',
      JSON.stringify(addrRes.data)
    );

    // 2. Fetch an active product and variant
    const productsRes = await request({ path: '/api/products', method: 'GET' });
    const productList = Array.isArray(productsRes.data?.data)
      ? productsRes.data.data
      : (productsRes.data?.data?.products || []);
    assert(productList.length > 0, 'Catalog products available for purchase', `Count: ${productList.length}`);

    const sampleProduct = productList[0];
    const sampleVariant = sampleProduct.variants[0];
    const initialStock = sampleVariant.stock;

    // 3. CART CHECKOUT FLOW
    // Add item to cart
    await request({
      path: '/api/cart/items',
      method: 'POST',
      headers: customerHeaders,
      body: {
        productId: sampleProduct._id,
        variantId: sampleVariant._id,
        quantity: 2,
      },
    });

    // POST /api/orders/checkout with source: "cart"
    const cartCheckoutRes = await request({
      path: '/api/orders/checkout',
      method: 'POST',
      headers: customerHeaders,
      body: {
        source: 'cart',
        addressId,
        paymentMethod: 'razorpay',
      },
    });

    assert(
      cartCheckoutRes.statusCode === 201 &&
        cartCheckoutRes.data?.data?.orderNumber?.startsWith('FD-') &&
        cartCheckoutRes.data?.data?.paymentMethod === 'razorpay' &&
        !!cartCheckoutRes.data?.data?.razorpayOrderId,
      'POST /api/orders/checkout (source: cart) returns order and razorpayOrderId',
      JSON.stringify(cartCheckoutRes.data)
    );

    const cartOrder = cartCheckoutRes.data?.data?.order;
    const razorpayOrderId = cartCheckoutRes.data?.data?.razorpayOrderId;

    // Verify stock was decremented atomically
    const pAfterCartRes = await request({ path: `/api/products/${sampleProduct.slug}`, method: 'GET' });
    const updatedStockAfterCart = pAfterCartRes.data?.data?.variants?.find(
      (v) => v._id === sampleVariant._id
    )?.stock;
    assert(
      updatedStockAfterCart === initialStock - 2,
      `Stock atomically reserved (-2): before=${initialStock}, after=${updatedStockAfterCart}`
    );

    // 4. VERIFY PAYMENT (HMAC SHA-256)
    const fakePaymentId = `pay_mock_${Date.now()}`;
    const generatedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpayOrderId}|${fakePaymentId}`)
      .digest('hex');

    const verifyRes = await request({
      path: '/api/orders/verify-payment',
      method: 'POST',
      headers: customerHeaders,
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: generatedSignature,
      },
    });

    const verifiedOrder = verifyRes.data?.data?.order || verifyRes.data?.data;
    assert(
      verifyRes.statusCode === 200 &&
        verifiedOrder?.payment?.status === 'paid' &&
        verifiedOrder?.orderStatus === 'confirmed',
      'POST /api/orders/verify-payment validates HMAC SHA256 and marks order confirmed/paid',
      JSON.stringify(verifyRes.data)
    );

    // Verify cart was cleared after successful cart checkout
    const cartAfterPayment = await request({ path: '/api/cart', method: 'GET', headers: customerHeaders });
    assert(
      cartAfterPayment.data?.data?.items?.length === 0,
      'Cart was automatically cleared after cart checkout verification'
    );

    // 5. BUY NOW CHECKOUT FLOW (Razorpay)
    const buyNowRes = await request({
      path: '/api/orders/checkout',
      method: 'POST',
      headers: customerHeaders,
      body: {
        source: 'buy_now',
        items: [
          {
            productId: sampleProduct._id,
            variantId: sampleVariant._id,
            quantity: 1,
          },
        ],
        addressId,
        paymentMethod: 'razorpay',
      },
    });

    assert(
      buyNowRes.statusCode === 201 &&
        buyNowRes.data?.data?.order?.source === 'buy_now' &&
        buyNowRes.data?.data?.order?.paymentMethod === 'razorpay',
      'POST /api/orders/checkout (source: buy_now, Razorpay) placed successfully',
      JSON.stringify(buyNowRes.data)
    );
    const buyNowOrderId = buyNowRes.data?.data?.order?._id;

    // 6. PAYMENT FAILED FLOW & STOCK RELEASE
    // Create an order intended to fail
    const failOrderRes = await request({
      path: '/api/orders/checkout',
      method: 'POST',
      headers: customerHeaders,
      body: {
        source: 'buy_now',
        items: [
          {
            productId: sampleProduct._id,
            variantId: sampleVariant._id,
            quantity: 1,
          },
        ],
        addressId,
        paymentMethod: 'razorpay',
      },
    });

    const failedRazorpayOrderId = failOrderRes.data?.data?.razorpayOrderId;
    const failedOrderId = failOrderRes.data?.data?.order?._id;

    // Check stock right before reporting failure
    const pBeforeFailRes = await request({ path: `/api/products/${sampleProduct.slug}`, method: 'GET' });
    const stockBeforeFail = pBeforeFailRes.data?.data?.variants?.find(
      (v) => v._id === sampleVariant._id
    )?.stock;

    // Call /api/orders/payment-failed
    const paymentFailedRes = await request({
      path: '/api/orders/payment-failed',
      method: 'POST',
      headers: customerHeaders,
      body: {
        razorpay_order_id: failedRazorpayOrderId,
        orderId: failedOrderId,
        reason: 'Payment cancelled by user',
      },
    });

    const failedOrderDoc = paymentFailedRes.data?.data?.order || paymentFailedRes.data?.data;
    assert(
      paymentFailedRes.statusCode === 200 &&
        failedOrderDoc?.payment?.status === 'failed',
      'POST /api/orders/payment-failed marks payment status as failed',
      JSON.stringify(paymentFailedRes.data)
    );

    // Verify stock restored
    const pAfterFailRes = await request({ path: `/api/products/${sampleProduct.slug}`, method: 'GET' });
    const stockAfterFail = pAfterFailRes.data?.data?.variants?.find(
      (v) => v._id === sampleVariant._id
    )?.stock;
    assert(
      stockAfterFail === stockBeforeFail + 1,
      `Stock released back on payment failure (+1): before=${stockBeforeFail}, after=${stockAfterFail}`
    );

    // 7. GET MY ORDERS (paginated) & GET ORDER BY ID
    const myOrdersRes = await request({ path: '/api/orders', method: 'GET', headers: customerHeaders });
    const customerOrders = Array.isArray(myOrdersRes.data?.data)
      ? myOrdersRes.data.data
      : (myOrdersRes.data?.data?.orders || []);
    assert(
      myOrdersRes.statusCode === 200 &&
        Array.isArray(customerOrders) &&
        customerOrders.length >= 2,
      'GET /api/orders returns paginated customer orders',
      `Count: ${customerOrders.length}`
    );

    const getSingleOrderRes = await request({
      path: `/api/orders/${cartOrder._id}`,
      method: 'GET',
      headers: customerHeaders,
    });
    const singleOrderDoc = getSingleOrderRes.data?.data?.order || getSingleOrderRes.data?.data;
    assert(
      getSingleOrderRes.statusCode === 200 &&
        singleOrderDoc?._id === cartOrder._id,
      'GET /api/orders/:id returns customer single order details',
      JSON.stringify(singleOrderDoc?.orderNumber)
    );

    // 8. CANCEL ORDER (Allowed before shipped)
    const cancelRes = await request({
      path: `/api/orders/${buyNowOrderId}/cancel`,
      method: 'PATCH',
      headers: customerHeaders,
      body: {
        reason: 'Placed by mistake, wanted a different flavor',
      },
    });

    const cancelledOrderDoc = cancelRes.data?.data?.order || cancelRes.data?.data;
    assert(
      cancelRes.statusCode === 200 &&
        cancelledOrderDoc?.orderStatus === 'cancelled' &&
        cancelledOrderDoc?.cancelReason === 'Placed by mistake, wanted a different flavor',
      'PATCH /api/orders/:id/cancel cancels order before shipping and releases stock',
      JSON.stringify(cancelRes.data)
    );

    // 9. WEBHOOK: POST /api/webhooks/razorpay
    const webhookPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            order_id: razorpayOrderId,
            amount: 50000,
            currency: 'INR',
            status: 'captured',
            method: 'upi',
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    const webhookSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const webhookRes = await request({
      path: '/api/webhooks/razorpay',
      method: 'POST',
      headers: {
        'x-razorpay-signature': webhookSignature,
      },
      body: webhookPayload,
    });

    assert(
      webhookRes.statusCode === 200 && (webhookRes.data?.received === true || webhookRes.data?.status === 'ok'),
      'POST /api/webhooks/razorpay validates X-Razorpay-Signature and processes idempotently',
      JSON.stringify(webhookRes.data)
    );

    // 10. ADMIN: GET /api/admin/orders
    const adminOrdersRes = await request({
      path: '/api/admin/orders?page=1&limit=10',
      method: 'GET',
      headers: adminHeaders,
    });

    const adminOrdersList = Array.isArray(adminOrdersRes.data?.data)
      ? adminOrdersRes.data.data
      : (adminOrdersRes.data?.data?.orders || []);

    assert(
      adminOrdersRes.statusCode === 200 && adminOrdersList.length > 0,
      'GET /api/admin/orders returns paginated orders for admin',
      `Count: ${adminOrdersList.length}`
    );

    // 11. ADMIN: PATCH /api/admin/orders/:id/status (Transition rules)
    const updateStatusRes = await request({
      path: `/api/admin/orders/${cartOrder._id}/status`,
      method: 'PATCH',
      headers: adminHeaders,
      body: {
        status: 'packed',
        note: 'Order carefully packed in sustainable cardboard packaging',
      },
    });

    const packedOrderDoc = updateStatusRes.data?.data?.order || updateStatusRes.data?.data;
    assert(
      updateStatusRes.statusCode === 200 &&
        packedOrderDoc?.orderStatus === 'packed' &&
        packedOrderDoc?.statusHistory?.some((h) => h.status === 'packed'),
      'PATCH /api/admin/orders/:id/status transitions confirmed -> packed with note and history',
      JSON.stringify(packedOrderDoc?.orderStatus)
    );

    // Transition packed -> shipped with trackingId and courierName
    const shipStatusRes = await request({
      path: `/api/admin/orders/${cartOrder._id}/status`,
      method: 'PATCH',
      headers: adminHeaders,
      body: {
        status: 'shipped',
        trackingId: 'DELHIVERY_TRACK_889900',
        courierName: 'Delhivery',
        note: 'Handed over to Delhivery logistics team',
      },
    });

    const shippedOrderDoc = shipStatusRes.data?.data?.order || shipStatusRes.data?.data;
    assert(
      shipStatusRes.statusCode === 200 &&
        shippedOrderDoc?.orderStatus === 'shipped' &&
        shippedOrderDoc?.trackingId === 'DELHIVERY_TRACK_889900' &&
        shippedOrderDoc?.courierName === 'Delhivery',
      'PATCH /api/admin/orders/:id/status transitions to shipped with trackingId & courierName',
      JSON.stringify(shippedOrderDoc?.trackingId)
    );

    // 12. ADMIN: GET /api/admin/dashboard
    const dashboardRes = await request({
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: adminHeaders,
    });

    const dashData = dashboardRes.data?.data;
    assert(
      dashboardRes.statusCode === 200 &&
        dashData?.revenue?.today !== undefined &&
        dashData?.revenue?.sevenDays !== undefined &&
        dashData?.revenue?.thirtyDays !== undefined &&
        Array.isArray(dashData?.dailyRevenueSeries) &&
        Array.isArray(dashData?.lowStockProducts) &&
        Array.isArray(dashData?.topProducts),
      'GET /api/admin/dashboard returns comprehensive stats (revenue, daily series, low stock, top products)',
      JSON.stringify(dashData?.revenue)
    );

    // 13. ADMIN: GET /api/admin/customers
    const customersRes = await request({
      path: '/api/admin/customers',
      method: 'GET',
      headers: adminHeaders,
    });

    const customerList = Array.isArray(customersRes.data?.data)
      ? customersRes.data.data
      : (customersRes.data?.data?.customers || []);

    assert(
      customersRes.statusCode === 200 &&
        Array.isArray(customerList) &&
        customerList.some((c) => c.email === testEmail && c.orderCount >= 1),
      'GET /api/admin/customers returns customer list with orderCount and totalSpent',
      JSON.stringify(customerList.find((c) => c.email === testEmail))
    );
  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   Verification Results: ${passed} PASSED, ${failed} FAILED `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
