import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@FynDry';

// Simple helper to send HTTP requests with cookies and authorization
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
        } catch (e) {
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

function extractCookie(headers, cookieName) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const cookieList = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const cookie of cookieList) {
    if (cookie.startsWith(`${cookieName}=`)) {
      return cookie;
    }
  }
  return null;
}

async function runTests() {
  console.log('==============================================');
  console.log('   FynDry Phase 1 Verification Test Suite     ');
  console.log('==============================================\n');

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
    // 1. GET /api/health
    const health = await request({ path: '/api/health', method: 'GET' });
    assert(
      health.statusCode === 200 && health.data.success === true,
      'GET /api/health returns 200 with operational status',
      JSON.stringify(health.data)
    );

    // 2. Validation error test on /api/auth/register
    const invalidReg = await request({
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'A', email: 'notanemail', password: '123' },
    });
    assert(
      invalidReg.statusCode === 400 && Array.isArray(invalidReg.data.errors),
      'POST /api/auth/register rejects invalid inputs with clear 400 validation messages',
      JSON.stringify(invalidReg.data)
    );

    // 3. POST /api/auth/register (Customer only)
    const testEmail = `testuser_${Date.now()}@fyndry.test`;
    const regRes = await request({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Test Customer',
        email: testEmail,
        password: 'Password123!',
        phone: '9988776655',
        role: 'admin', // Should be forced to 'customer'
      },
    });

    const regCookie = extractCookie(regRes.headers, 'refreshToken');
    assert(
      regRes.statusCode === 201 &&
        regRes.data.success === true &&
        regRes.data.data.user.role === 'customer' &&
        !!regRes.data.data.accessToken &&
        !!regCookie,
      'POST /api/auth/register creates customer (forces customer role), returns accessToken & refreshToken cookie',
      JSON.stringify(regRes.data)
    );

    const customerAccessToken = regRes.data.data.accessToken;

    // 4. GET /api/auth/me (Protected route)
    const meRes = await request({
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerAccessToken}` },
    });
    assert(
      meRes.statusCode === 200 &&
        meRes.data.success === true &&
        meRes.data.data.user.email === testEmail,
      'GET /api/auth/me returns authenticated customer user object',
      JSON.stringify(meRes.data)
    );

    // 5. POST /api/auth/refresh (Token rotation)
    const refreshRes = await request({
      path: '/api/auth/refresh',
      method: 'POST',
      headers: { Cookie: regCookie },
    });
    const newRefreshCookie = extractCookie(refreshRes.headers, 'refreshToken');
    assert(
      refreshRes.statusCode === 200 &&
        refreshRes.data.success === true &&
        !!refreshRes.data.data.accessToken &&
        !!newRefreshCookie,
      'POST /api/auth/refresh rotates refresh token cookie and issues new accessToken',
      JSON.stringify(refreshRes.data)
    );

    const rotatedAccessToken = refreshRes.data.data.accessToken;

    // 6. PATCH /api/auth/change-password
    const changePassRes = await request({
      path: '/api/auth/change-password',
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${rotatedAccessToken}`,
      },
      body: {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      },
    });
    assert(
      changePassRes.statusCode === 200 && changePassRes.data.success === true,
      'PATCH /api/auth/change-password updates password and rotates session',
      JSON.stringify(changePassRes.data)
    );

    // 7. POST /api/auth/login with new password
    const loginRes = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: testEmail,
        password: 'NewPassword123!',
      },
    });
    const loginCookie = extractCookie(loginRes.headers, 'refreshToken');
    assert(
      loginRes.statusCode === 200 &&
        loginRes.data.success === true &&
        !!loginRes.data.data.accessToken &&
        !!loginCookie,
      'POST /api/auth/login succeeds with updated credentials and sets cookie',
      JSON.stringify(loginRes.data)
    );

    // 8. Role guard test: Customer accessing Admin endpoint
    const forbiddenAdminRes = await request({
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${loginRes.data.data.accessToken}` },
    });
    assert(
      forbiddenAdminRes.statusCode === 403,
      'Role guard: Customer is rejected (403 Forbidden) from admin-only routes',
      `Status: ${forbiddenAdminRes.statusCode}`
    );

    // 9. Admin Login & Access Guard Test
    const adminLoginRes = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: 'admin@fyndry.com',
        password: ADMIN_PASSWORD,
      },
    });
    assert(
      adminLoginRes.statusCode === 200 &&
        adminLoginRes.data.data.user.role === 'admin',
      'Admin login succeeds with seeded admin credentials and has role "admin"',
      JSON.stringify(adminLoginRes.data)
    );

    const adminAccessToken = adminLoginRes.data.data.accessToken;
    const adminStatsRes = await request({
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });
    assert(
      adminStatsRes.statusCode === 200 && adminStatsRes.data.success === true,
      'Admin role guard: Seeded admin successfully accesses /api/admin/stats',
      JSON.stringify(adminStatsRes.data)
    );

    // 10. POST /api/auth/logout
    const logoutRes = await request({
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Cookie: loginCookie },
    });
    const clearedCookie = extractCookie(logoutRes.headers, 'refreshToken');
    assert(
      logoutRes.statusCode === 200 &&
        logoutRes.data.success === true &&
        (clearedCookie.includes('Max-Age=0') || clearedCookie.includes('expires=')),
      'POST /api/auth/logout revokes session and clears refreshToken cookie',
      JSON.stringify(logoutRes.data)
    );

    console.log('\n==============================================');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('==============================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite encountered unhandled error:', err);
    process.exit(1);
  }
}

runTests();
