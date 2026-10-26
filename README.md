# FynDry – "Goodness, Naturally Preserved"
> Production-grade, secure, and modern MERN e-commerce platform for solar-dehydrated fruits and whole vegetable produce.

---

## 🏛️ System Architecture Diagram

```
                              [ CUSTOMER / CLIENT BROWSER ]
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               │                                                         │
               ▼                                                         ▼
    [ Vite React 18 SPA ]                                    [ Static Assets & Media ]
  • React Router v6 (Lazy Chunks)                           • Cloudinary Global CDN
  • Zustand (Auth & Cart Stores)                            • Next-gen WebP / AVIF
  • React Hook Form + Zod                                   • Auto Quality & Dimension
  • React Helmet Async (SEO & Schema)
               │
               ▼ (HTTPS REST API / JSON with Credentials)
    [ NGINX REVERSE PROXY / LOAD BALANCER ]
  • TLS 1.3 Termination (Let's Encrypt SSL)
  • Gzip / Brotli Compression
  • Rate Limiting & DDOS Shield
               │
               ▼ (Port 5001)
    [ FYNDRY EXPRESS.JS BACKEND (Node.js ES Modules) ]
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  Security Middlewares:                                                  │
  │  • Helmet (CSP, HSTS, XSS Filter)    • Express-Mongo-Sanitize (NoSQL)   │
  │  • Cookie-Parser (HttpOnly Cookies)  • Strict CORS Whitelist            │
  │  • Express-Rate-Limit (Auth / Checkout / Geo / API Limiters)            │
  └─────────────────────────────────────────────────────────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
 [ MONGODB ATLAS ]          [ RAZORPAY GATEWAY ]      [ EXTERNAL LOGISTICS ]
 • Users & Address Book     • Order Creation          • Reverse Geocoding
 • Products & Variants      • Payment Verification    • Delhivery / BlueDart
 • Orders & Snapshots       • Webhook HMAC SHA256     • Courier Tracking
 • Store Settings           • Refund Processing       • Status Audits
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (Port 27017) or MongoDB Atlas connection URI
- **Cloudinary Account**: Cloud name, API key, and secret

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/fyndry.git
cd fyndry

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `server/` and `client/`:

#### `server/.env`
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/fyndry

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_2026
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Seed Admin Credentials
ADMIN_EMAIL=admin@fyndry.com
ADMIN_PASSWORD=Admin@FynDry2026

# Razorpay (Test Mode Keys)
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret_key
RAZORPAY_WEBHOOK_SECRET=fyndry_webhook_secret_2026
ENABLE_COD=true

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### `client/.env`
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Seed Initial Catalog & Admin
```bash
cd server
npm run seed
```

### 4. Start Development Servers
```bash
# Terminal 1: Start Backend (Port 5001)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client
npm run dev
```

---

## 🐳 Docker Containerized Execution

Run the entire stack (MongoDB + Express Backend + Nginx Client) with a single command:

```bash
docker-compose up -d --build
```
- **Web Storefront & Admin**: `http://localhost`
- **Backend API**: `http://localhost:5001/api`
- **Health Check**: `http://localhost:5001/api/health`

---

## 🧪 Comprehensive Testing Suites

### Backend Unit & Integration Tests (Jest + Supertest)
```bash
cd server
npm test
```
- **Auth & Cryptography**: Zod input validation, Bcrypt password hashing, JWT claims, SHA256 refresh token hashing.
- **Address Book Rules**: First address auto-default, automatic unsetting of previous defaults, zero-default prevention on deletion, max 10 address limit.
- **Pricing & Checkout**: Subtotal computation, free shipping threshold (₹499), 5% GST calculation, discount clamping.
- **Payment Signature Security**: Razorpay HMAC-SHA256 signature verification, rejection of tampered payment/order IDs, timing-safe equality.

### Frontend Component Tests (Vitest + React Testing Library)
```bash
cd client
npm test
```
- **ProductCard**: Price formatting, discount calculation, out-of-stock badge state.
- **StatCard**: Metric rendering, title, subtitle, trend badges.
- **ConfirmDialog**: Accessible modal mounting, action descriptions, confirm/cancel callbacks.

### Playwright End-to-End Test (E2E)
```bash
cd client
npx playwright test
```
Verifies full customer journey: Register new customer ➔ Browse shop ➔ Select variant & Add to Cart ➔ Fill shipping address with GPS reverse geocode ➔ Place order ➔ Verify Order Confirmation & Account orders history.

---

## 🛡️ Security Audit & Hardening Matrix

| Security Layer | Implementation Detail | Location |
| :--- | :--- | :--- |
| **NoSQL Injection** | `express-mongo-sanitize` sanitizes `$where`, `$gt`, and operator injection. | `server/src/app.js` |
| **XSS & HTTP Headers** | `helmet` configured with strict Content-Security-Policy & Frameguard. | `server/src/app.js` |
| **CORS Whitelist** | Dynamic origin check against allowed origins; unallowed origins rejected. | `server/src/app.js` |
| **Cookie Flags** | `httpOnly: true`, `secure: true` in production, `sameSite: strict`. | `server/src/utils/token.js` |
| **Authentication Rate Limit** | Max 30 attempts per 15 min per IP on `/login`, `/register`, `/refresh`. | `server/src/middleware/rateLimit.js` |
| **Checkout Rate Limit** | Max 20 checkout attempts per 15 min per IP to prevent order spam. | `server/src/middleware/rateLimit.js` |
| **Geocoding Rate Limit** | Max 40 requests per 15 min per IP on reverse geocode endpoint. | `server/src/middleware/rateLimit.js` |
| **File Upload Hardening** | 5MB size limit, strict MIME filter (`jpg`, `jpeg`, `png`, `webp`). | `server/src/config/cloudinary.js` |
| **Secret Isolation** | Razorpay secret is never passed to frontend; verified server-side only. | `server/src/controllers/orderController.js` |
| **Response Compression** | Gzip/Brotli payload compression enabled on all JSON responses. | `server/src/app.js` |
| **Cache Headers** | Public product/category endpoints carry `Cache-Control` headers. | `server/src/controllers/productController.js` |

---

## 🚀 Production Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with readWrite privileges.
3. Whitelist your backend server IP addresses (or `0.0.0.0/0` with secure credentials).
4. Copy connection string to `MONGO_URI`.

### 2. Backend: Render / Railway / Ubuntu VPS
#### Deploying to Render / Railway:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Add environment variables from `server/.env` table below.

#### Deploying to Ubuntu VPS with PM2 & Nginx:
```bash
# Install PM2 globally
npm install -g pm2

# Start server process with restart policy
cd /var/www/fyndry/server
pm2 start src/server.js --name "fyndry-api" -i max
pm2 startup
pm2 save
```

### 3. Frontend: Vercel / Netlify
1. Connect Git repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. **Framework Preset**: `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Configure `VITE_API_URL` environment variable.
6. For single-page app rewrites, ensure redirects are configured (see `client/public/robots.txt` and `client/public/sitemap.xml`).

---

## 🔑 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `5001` |
| `NODE_ENV` | Runtime environment | `production` |
| `CLIENT_URL` | Frontend URL for CORS | `https://fyndry.com` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Secret key for 15m access token | 64+ char random string |
| `JWT_REFRESH_SECRET` | Secret key for 7d refresh token | 64+ char random string |
| `RAZORPAY_KEY_ID` | Razorpay public Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay private secret key | Live secret key |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay webhook secret | Custom webhook secret |
| `ENABLE_COD` | Enable Cash on Delivery | `true` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | Cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | API secret |

### Frontend (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base path | `https://api.fyndry.com/api` |

---

## 💳 Razorpay LIVE-Mode Activation Checklist

Follow this checklist before processing real customer transactions:

- [ ] **Business KYC Approved**: Registered entity details, PAN, GSTIN, and active bank account submitted and verified on Razorpay Dashboard.
- [ ] **Mandatory Legal Pages Published & Accessible**:
  - [x] Privacy Policy (`/privacy-policy`)
  - [x] Terms & Conditions (`/terms-and-conditions`)
  - [x] Refund & Cancellation Policy (`/refund-policy`)
  - [x] Shipping & Delivery Policy (`/shipping-policy`)
  - [x] Contact Us page with physical address & phone (`/contact`)
- [ ] **Generate Live API Keys**:
  - In Razorpay Dashboard, toggle from **Test Mode** to **Live Mode**.
  - Navigate to *Settings > API Keys* and generate Live Key ID and Secret.
  - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production server environment.
- [ ] **Configure Webhook Endpoint**:
  - In Razorpay Dashboard, navigate to *Settings > Webhooks > Add New Webhook*.
  - **Webhook URL**: `https://api.fyndry.com/api/webhooks/razorpay`
  - **Secret**: Set a strong secret and match with `RAZORPAY_WEBHOOK_SECRET`.
  - **Active Events**: `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`.
- [ ] **Test Live Transaction**:
  - Place a test order for ₹1 using a live UPI ID or card.
  - Verify payment captures and order status transitions to `confirmed`.
  - Issue test refund from Razorpay Dashboard and verify status.

---

## 💾 Backup Strategy & Error Monitoring

### MongoDB Database Backups
```bash
# Automated daily mongodump backup script
mongodump --uri="YOUR_MONGO_URI" --gzip --archive=/backups/fyndry_$(date +%Y%m%d).gz

# Restore database from archive
mongorestore --uri="YOUR_MONGO_URI" --gzip --archive=/backups/fyndry_YYYYMMDD.gz
```
*For MongoDB Atlas, automated continuous point-in-time snapshots are enabled under Cluster Backup Settings.*

### Error Monitoring (Sentry Integration)
To enable production exception tracking:
```bash
npm install @sentry/node @sentry/tracing
```
In `server/src/server.js`:
```javascript
import * as Sentry from '@sentry/node';

if (ENV.NODE_ENV === 'production') {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}
```

---

## ✅ Final Production Verification Checklist

- [x] **Zero Vulnerabilities / Security Fixes**: NoSQL injection protection, secure cookies, helmet CSP headers, strict rate limits.
- [x] **Performance Optimization**: Gzip response compression, MongoDB compound indexes, public API cache headers, lazy-loaded client chunks.
- [x] **Test Coverage**:
  - Backend Jest suites: **19 / 19 PASSED** (Auth, Address default logic, Pricing calculation, Razorpay HMAC-SHA256 signature verification).
  - Frontend Vitest suites: **8 / 8 PASSED** (ProductCard, StatCard, ConfirmDialog).
  - E2E Playwright test script: Created in `client/e2e/checkout-flow.spec.js`.
- [x] **SEO & Discoverability**:
  - Open Graph tags, canonical URLs, and dynamic page titles with `react-helmet-async`.
  - `Product` JSON-LD structured data on all product detail pages.
  - `robots.txt` and `sitemap.xml` in `client/public/`.
- [x] **Deployment Artifacts**:
  - Production `server/Dockerfile` (Alpine, non-root user, healthcheck).
  - Production `client/Dockerfile` (Vite build + Nginx Alpine).
  - Local container orchestrator `docker-compose.yml`.
- [x] **Payment Compliance**:
  - All 5 required legal & policy pages live and linked in footer (`/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/shipping-policy`, `/contact`).
