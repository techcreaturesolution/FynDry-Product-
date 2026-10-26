import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

// Connect to MongoDB Database
connectDB();

const server = app.listen(ENV.PORT, () => {
  console.log(`[FynDry Server] Running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
  console.log(`[FynDry Server] Healthcheck available at: http://localhost:${ENV.PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
