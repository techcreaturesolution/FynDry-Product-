import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';

import { ENV } from './config/env.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/error.js';
import { apiLimiter, geoLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { cleanupUnpaidOrders } from './controllers/orderController.js';
import { getPublicSettings } from './controllers/adminController.js';

const app = express();

// Security HTTP headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration (Origin from environment, credentials true)
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, Postman, curl, webhooks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS error: Origin ${origin} not allowed by policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Razorpay-Signature'],
  })
);

// HTTP request logger
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Response compression for optimal payload delivery
app.use(compression());

// Request body parsers with limits & rawBody buffer capture for webhooks
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request data against NoSQL injection
app.use(
  mongoSanitize({
    allowDots: true,
    replaceWith: '_',
  })
);

// Cookie parser for refresh token
app.use(cookieParser());

// Static uploads serving
app.use('/uploads', express.static(path.resolve('public/uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FynDry API is operational',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// General rate limiter for standard API routes (bypass webhooks)
app.use('/api/webhooks', webhookRoutes);
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/geo', geoLimiter, geoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/settings', getPublicSettings);
app.use('/api/admin', adminRoutes);

// Periodic cleanup worker: releases stock for expired unpaid orders (>30m)
if (ENV.NODE_ENV !== 'test') {
  setInterval(() => {
    cleanupUnpaidOrders().catch((err) =>
      console.error('[Cleanup Worker Error]:', err.message)
    );
  }, 10 * 60 * 1000);
}

// 404 Handler for undefined routes
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
