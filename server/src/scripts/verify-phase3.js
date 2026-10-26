import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

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
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(`   FynDry Phase 3 Cart & Profile Verification       `);
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
    // 1. Create and authenticate a new Customer
    const testEmail = `phase3_user_${Date.now()}@fyndry.test`;
    const regRes = await request({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Phase 3 Customer',
        email: testEmail,
        password: 'CustomerPassword123!',
        phone: '9876543210',
      },
    });

    assert(
      regRes.statusCode === 201 && !!regRes.data?.data?.accessToken,
      'Customer registered for Phase 3 tests',
      JSON.stringify(regRes.data)
    );

    const token = regRes.data?.data?.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Profile Endpoints
    // GET /api/users/me
    const profileRes = await request({ path: '/api/users/me', method: 'GET', headers: authHeaders });
    assert(
      profileRes.statusCode === 200 &&
        profileRes.data.success === true &&
        profileRes.data.data.user.email === testEmail,
      'GET /api/users/me returns authenticated customer profile',
      JSON.stringify(profileRes.data)
    );

    // PATCH /api/users/me
    const updateProfileRes = await request({
      path: '/api/users/me',
      method: 'PATCH',
      headers: authHeaders,
      body: {
        name: 'Updated Phase 3 Customer',
        phone: '9822334455',
        avatar: 'https://example.com/avatar.jpg',
      },
    });
    assert(
      updateProfileRes.statusCode === 200 &&
        updateProfileRes.data.data.user.name === 'Updated Phase 3 Customer' &&
        updateProfileRes.data.data.user.phone === '9822334455' &&
        updateProfileRes.data.data.user.avatar === 'https://example.com/avatar.jpg',
      'PATCH /api/users/me updates name, phone, and avatar',
      JSON.stringify(updateProfileRes.data)
    );

    // 3. Address Book Endpoints
    // POST /api/addresses (First address -> should auto-set isDefault: true)
    const addr1Res = await request({
      path: '/api/addresses',
      method: 'POST',
      headers: authHeaders,
      body: {
        fullName: 'Phase 3 Customer',
        phone: '9876543210',
        addressLine1: 'Flat 402, Lotus Court',
        addressLine2: 'Bandra West',
        landmark: 'Near Carter Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India',
        label: 'Home',
      },
    });
    assert(
      addr1Res.statusCode === 201 &&
        addr1Res.data.success === true &&
        addr1Res.data.data.isDefault === true,
      'POST /api/addresses creates first address and auto-marks it as isDefault: true',
      JSON.stringify(addr1Res.data)
    );
    const addr1Id = addr1Res.data.data._id;

    // POST /api/addresses (Second address with isDefault: true -> unsets addr1 default)
    const addr2Res = await request({
      path: '/api/addresses',
      method: 'POST',
      headers: authHeaders,
      body: {
        fullName: 'Phase 3 Customer (Office)',
        phone: '9876543210',
        addressLine1: '12th Floor, Trade Hub',
        addressLine2: 'Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        label: 'Work',
        isDefault: true,
      },
    });
    assert(
      addr2Res.statusCode === 201 && addr2Res.data.data.isDefault === true,
      'POST /api/addresses creates second address as default',
      JSON.stringify(addr2Res.data)
    );
    const addr2Id = addr2Res.data.data._id;

    // Verify exactly one default
    const getAddrsRes = await request({ path: '/api/addresses', method: 'GET', headers: authHeaders });
    const defaults = getAddrsRes.data.data.filter((a) => a.isDefault);
    assert(
      getAddrsRes.statusCode === 200 &&
        getAddrsRes.data.count === 2 &&
        defaults.length === 1 &&
        defaults[0]._id === addr2Id,
      'GET /api/addresses returns 2 addresses with exactly one default (addr2)',
      `Defaults count: ${defaults.length}`
    );

    // PATCH /api/addresses/:id/default (Switch default to addr1)
    const switchDefRes = await request({
      path: `/api/addresses/${addr1Id}/default`,
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(
      switchDefRes.statusCode === 200 && switchDefRes.data.data.isDefault === true,
      'PATCH /api/addresses/:id/default sets addr1 as default',
      JSON.stringify(switchDefRes.data)
    );

    // PATCH /api/addresses/:id (Update addressLine2)
    const updateAddrRes = await request({
      path: `/api/addresses/${addr1Id}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { landmark: 'Opposite Sea View Promenade' },
    });
    assert(
      updateAddrRes.statusCode === 200 &&
        updateAddrRes.data.data.landmark === 'Opposite Sea View Promenade',
      'PATCH /api/addresses/:id updates landmark',
      JSON.stringify(updateAddrRes.data)
    );

    // DELETE /api/addresses/:id (Delete default addr1 -> addr2 must become default)
    const delAddrRes = await request({
      path: `/api/addresses/${addr1Id}`,
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(
      delAddrRes.statusCode === 200 && delAddrRes.data.success === true,
      'DELETE /api/addresses/:id deletes address',
      JSON.stringify(delAddrRes.data)
    );

    const afterDelAddrs = await request({ path: '/api/addresses', method: 'GET', headers: authHeaders });
    assert(
      afterDelAddrs.data.count === 1 && afterDelAddrs.data.data[0].isDefault === true,
      'Rule verified: Cannot leave user with zero default when deleting default address',
      JSON.stringify(afterDelAddrs.data)
    );

    // 4. Reverse Geocoding
    // POST /api/geo/reverse
    const geoRes = await request({
      path: '/api/geo/reverse',
      method: 'POST',
      body: { lat: 19.076, lng: 72.8777 },
    });
    assert(
      geoRes.statusCode === 200 &&
        geoRes.data.success === true &&
        !!geoRes.data.data.formattedAddress,
      'POST /api/geo/reverse successfully returns structured address from coordinates',
      JSON.stringify(geoRes.data)
    );

    // 5. Cart & Pricing Endpoints
    // Fetch an active product to test cart
    const prodList = await request({ path: '/api/products', method: 'GET' });
    const sampleProd = prodList.data.data[0];
    const sampleVariant = sampleProd.variants[0];

    // POST /api/cart/items
    const addCartRes = await request({
      path: '/api/cart/items',
      method: 'POST',
      headers: authHeaders,
      body: {
        productId: sampleProd._id,
        variantId: sampleVariant._id,
        quantity: 2,
      },
    });
    assert(
      addCartRes.statusCode === 200 &&
        addCartRes.data.success === true &&
        addCartRes.data.data.items.length === 1 &&
        addCartRes.data.data.items[0].quantity === 2 &&
        addCartRes.data.data.pricing.subtotal === sampleVariant.price * 2,
      'POST /api/cart/items adds variant to cart and computes pricing breakdown',
      JSON.stringify(addCartRes.data)
    );
    const cartItemId = addCartRes.data.data.items[0]._id;

    // GET /api/cart
    const getCartRes = await request({ path: '/api/cart', method: 'GET', headers: authHeaders });
    assert(
      getCartRes.statusCode === 200 &&
        getCartRes.data.data.items[0].lineTotal === sampleVariant.price * 2 &&
        getCartRes.data.data.pricing.total > 0,
      'GET /api/cart returns populated items with line total and pricing breakdown',
      JSON.stringify(getCartRes.data)
    );

    // PATCH /api/cart/items/:itemId
    const patchCartRes = await request({
      path: `/api/cart/items/${cartItemId}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { quantity: 3 },
    });
    assert(
      patchCartRes.statusCode === 200 && patchCartRes.data.data.items[0].quantity === 3,
      'PATCH /api/cart/items/:itemId updates item quantity to 3',
      JSON.stringify(patchCartRes.data)
    );

    // POST /api/cart/merge (Guest cart merging)
    const secondProd = prodList.data.data[1];
    const secondVariant = secondProd.variants[0];
    const mergeRes = await request({
      path: '/api/cart/merge',
      method: 'POST',
      headers: authHeaders,
      body: {
        items: [{ productId: secondProd._id, variantId: secondVariant._id, quantity: 1 }],
      },
    });
    assert(
      mergeRes.statusCode === 200 && mergeRes.data.data.items.length === 2,
      'POST /api/cart/merge merges guest cart items from localStorage',
      `Items count: ${mergeRes.data.data?.items?.length}`
    );

    // DELETE /api/cart/items/:itemId (Remove one item)
    const removeOneRes = await request({
      path: `/api/cart/items/${cartItemId}`,
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(
      removeOneRes.statusCode === 200 && removeOneRes.data.data.items.length === 1,
      'DELETE /api/cart/items/:itemId removes single item from cart',
      `Items count: ${removeOneRes.data.data?.items?.length}`
    );

    // DELETE /api/cart (Clear all)
    const clearCartRes = await request({
      path: '/api/cart',
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(
      clearCartRes.statusCode === 200 && clearCartRes.data.data.items.length === 0,
      'DELETE /api/cart clears all items from cart',
      JSON.stringify(clearCartRes.data)
    );

    console.log('\n====================================================');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test Suite encountered unhandled error:', err);
    process.exit(1);
  }
}

runTests();
