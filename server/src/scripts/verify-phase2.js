import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;
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
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(`   FynDry Phase 2 Catalog Verification Test Suite   `);
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
    // 1. GET /api/categories
    const catRes = await request({ path: '/api/categories', method: 'GET' });
    assert(
      catRes.statusCode === 200 &&
        catRes.data.success === true &&
        Array.isArray(catRes.data.data) &&
        catRes.data.data.length >= 3,
      'GET /api/categories returns active categories list with product counts',
      JSON.stringify(catRes.data)
    );

    const fruitCat = catRes.data.data.find((c) => c.slug === 'fruit-snacks');
    assert(
      fruitCat && fruitCat.name === 'Fruit Snacks',
      'Fruit Snacks category found in /api/categories',
      JSON.stringify(fruitCat)
    );

    // 2. GET /api/products (All active products)
    const prodsRes = await request({ path: '/api/products', method: 'GET' });
    assert(
      prodsRes.statusCode === 200 &&
        prodsRes.data.success === true &&
        prodsRes.data.total >= 6 &&
        Array.isArray(prodsRes.data.data) &&
        prodsRes.data.data[0].minPrice !== undefined &&
        prodsRes.data.data[0].inStock !== undefined,
      'GET /api/products returns paginated products with minPrice and inStock virtuals',
      `Count: ${prodsRes.data?.data?.length}`
    );

    // 3. GET /api/products?category=fruit-snacks
    const filterCatRes = await request({
      path: '/api/products?category=fruit-snacks',
      method: 'GET',
    });
    assert(
      filterCatRes.statusCode === 200 &&
        filterCatRes.data.data.length === 2 &&
        filterCatRes.data.data.every((p) => p.category?.slug === 'fruit-snacks'),
      'GET /api/products?category=fruit-snacks correctly filters products by category slug',
      `Count: ${filterCatRes.data?.data?.length}`
    );

    // 4. GET /api/products?search=apple
    const searchRes = await request({ path: '/api/products?search=apple', method: 'GET' });
    assert(
      searchRes.statusCode === 200 &&
        searchRes.data.data.some((p) => p.slug === 'apple-slices'),
      'GET /api/products?search=apple returns Apple Slices',
      `Found: ${searchRes.data?.data?.map((p) => p.slug).join(', ')}`
    );

    // 5. GET /api/products?minPrice=200&maxPrice=300
    const priceFilterRes = await request({
      path: '/api/products?minPrice=200&maxPrice=300',
      method: 'GET',
    });
    assert(
      priceFilterRes.statusCode === 200 && priceFilterRes.data.data.length > 0,
      'GET /api/products?minPrice=200&maxPrice=300 filters variants by price bounds',
      `Count: ${priceFilterRes.data?.data?.length}`
    );

    // 6. GET /api/products/featured
    const featuredRes = await request({ path: '/api/products/featured', method: 'GET' });
    assert(
      featuredRes.statusCode === 200 &&
        featuredRes.data.success === true &&
        featuredRes.data.data.length > 0 &&
        featuredRes.data.data.every((p) => p.isFeatured === true),
      'GET /api/products/featured returns only isFeatured=true products',
      `Count: ${featuredRes.data?.data?.length}`
    );

    // 7. GET /api/products/:slug (apple-slices)
    const slugRes = await request({ path: '/api/products/apple-slices', method: 'GET' });
    assert(
      slugRes.statusCode === 200 &&
        slugRes.data.success === true &&
        slugRes.data.data.slug === 'apple-slices' &&
        slugRes.data.data.variants?.length === 2 &&
        slugRes.data.data.accentColor === '#D62828',
      'GET /api/products/:slug returns complete single product document with variants & images',
      JSON.stringify(slugRes.data)
    );

    // 8. Admin Authentication
    const adminLogin = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    assert(
      adminLogin.statusCode === 200 && !!adminLogin.data?.data?.accessToken,
      'Admin logs in successfully and receives JWT access token',
      JSON.stringify(adminLogin.data)
    );
    const adminToken = adminLogin.data?.data?.accessToken;
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // 9. Admin Category CRUD
    // POST /api/admin/categories
    const newCatRes = await request({
      path: '/api/admin/categories',
      method: 'POST',
      headers: authHeaders,
      body: {
        name: 'Organic Teas',
        slug: 'organic-teas',
        description: 'Naturally dehydrated herbal infusions.',
        order: 10,
      },
    });
    assert(
      newCatRes.statusCode === 201 && newCatRes.data.success === true,
      'POST /api/admin/categories creates new category',
      JSON.stringify(newCatRes.data)
    );
    const createdCatId = newCatRes.data?.data?._id;

    // PATCH /api/admin/categories/:id
    const updateCatRes = await request({
      path: `/api/admin/categories/${createdCatId}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { description: 'Updated herbal tea description.' },
    });
    assert(
      updateCatRes.statusCode === 200 &&
        updateCatRes.data.data.description === 'Updated herbal tea description.',
      'PATCH /api/admin/categories/:id updates category fields',
      JSON.stringify(updateCatRes.data)
    );

    // DELETE /api/admin/categories/:id
    const delCatRes = await request({
      path: `/api/admin/categories/${createdCatId}`,
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(
      delCatRes.statusCode === 200 && delCatRes.data.success === true,
      'DELETE /api/admin/categories/:id deletes empty category',
      JSON.stringify(delCatRes.data)
    );

    // 10. Admin Product Management
    // POST /api/admin/products
    const newProdRes = await request({
      path: '/api/admin/products',
      method: 'POST',
      headers: authHeaders,
      body: {
        name: 'Mango Crisps',
        slug: `mango-crisps-${Date.now()}`,
        tagline: 'Tropical sweetness, dehydrated crisp.',
        category: fruitCat._id,
        description: 'Sun-drenched Alphonso mango slices naturally dehydrated into crispy chips.',
        highlights: ['Alphonso mangoes', 'Zero sugar added'],
        accentColor: '#FFA000',
        variants: [
          { label: '100g', price: 299, mrp: 349, stock: 40, sku: 'FYN-MAN-100' },
          { label: '250g', price: 699, mrp: 799, stock: 25, sku: 'FYN-MAN-250' },
        ],
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            publicId: 'sample-mango-1',
          },
        ],
        tags: ['mango', 'tropical', 'fruit', 'crisp'],
        isActive: true,
      },
    });
    assert(
      newProdRes.statusCode === 201 && newProdRes.data.success === true,
      'POST /api/admin/products creates product with variants and images',
      JSON.stringify(newProdRes.data)
    );
    const createdProdId = newProdRes.data?.data?._id;

    // PATCH /api/admin/products/:id/stock
    const stockRes = await request({
      path: `/api/admin/products/${createdProdId}/stock`,
      method: 'PATCH',
      headers: authHeaders,
      body: {
        sku: 'FYN-MAN-100',
        stock: 95,
      },
    });
    assert(
      stockRes.statusCode === 200 &&
        stockRes.data.data.variants.find((v) => v.sku === 'FYN-MAN-100')?.stock === 95,
      'PATCH /api/admin/products/:id/stock updates specific variant stock count',
      JSON.stringify(stockRes.data)
    );

    // PATCH /api/admin/products/:id/toggle
    const toggleRes = await request({
      path: `/api/admin/products/${createdProdId}/toggle`,
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(
      toggleRes.statusCode === 200 && toggleRes.data.data.isActive === false,
      'PATCH /api/admin/products/:id/toggle deactivates product',
      JSON.stringify(toggleRes.data)
    );

    // GET /api/admin/products (includes inactive)
    const adminProdsRes = await request({
      path: '/api/admin/products?status=inactive',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      adminProdsRes.statusCode === 200 &&
        adminProdsRes.data.data.some((p) => p._id === createdProdId),
      'GET /api/admin/products retrieves products including inactive items',
      `Count: ${adminProdsRes.data?.data?.length}`
    );

    // DELETE /api/admin/products/:id (hard delete)
    const delProdRes = await request({
      path: `/api/admin/products/${createdProdId}?hard=true`,
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(
      delProdRes.statusCode === 200 && delProdRes.data.success === true,
      'DELETE /api/admin/products/:id?hard=true permanently removes product',
      JSON.stringify(delProdRes.data)
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
