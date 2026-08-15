import dotenv from 'dotenv';

// Load environment variables before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import { createIndexes } from './models/indexes';
import { 
  compressionMiddleware, 
  securityMiddleware, 
  cacheMiddleware, 
  rateLimitMiddleware, 
  performanceMiddleware, 
  optimizedCors 
} from './middleware/performance';
import { imageOptimizationMiddleware } from './middleware/imageOptimization';
import { monitoringService, monitoringMiddleware } from './services/monitoring';

const app = express();

// === CORS Setup ===
const allowedOrigins = (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
  'https://api.razorpay.com',
  'https://rzp.io'
]).map(origin => origin.trim());

// Log the allowed origins for debugging
console.log('✅ CORS enabled for:', allowedOrigins);

// === Performance & Security Middleware ===
app.use(monitoringMiddleware);
app.use(performanceMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(imageOptimizationMiddleware);
app.use(optimizedCors(allowedOrigins));

// === Rate Limiting ===
// Temporarily disable rate limiting for Google OAuth to troubleshoot 429 errors
// app.use('/api/auth/google', rateLimitMiddleware(500, 15 * 60 * 1000)); // 500 Google OAuth requests per 15 min
app.use('/api/auth/refresh', rateLimitMiddleware(300, 15 * 60 * 1000)); // 300 refresh requests per 15 min
app.use('/api/auth', rateLimitMiddleware(100, 15 * 60 * 1000)); // 100 other auth requests per 15 min
app.use('/api/orders', rateLimitMiddleware(10, 60 * 1000)); // 10 order requests per minute
app.use('/api/upload', rateLimitMiddleware(3, 60 * 1000)); // 3 uploads per minute
app.use('/api', rateLimitMiddleware(100, 15 * 60 * 1000)); // General API rate limit

// === Body Parsing Middleware ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Caching ===
app.use('/api/products', cacheMiddleware(300)); // Cache products for 5 minutes

// === Image Serving with CORS ===
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// === Health & Monitoring Endpoints ===
app.get('/health', (req, res) => {
  res.json(monitoringService.getHealthStatus());
});

app.get('/api/stats', (req, res) => {
  const stats = monitoringService.getStats();
  if (!stats) {
    return res.status(404).json({ message: 'No stats available yet' });
  }
  res.json(stats);
});

// === Database Connection ===
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set. Please define it in your .env file.');
}

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50, // Maximum number of sockets in the connection pool
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server before throwing an error
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
  retryWrites: true, // Retry writes upon network errors
  w: 'majority', // Write concern
  readPreference: 'secondaryPreferred', // Prefer secondary reads for better performance
  connectTimeoutMS: 10000, // How long to attempt a connection before timing out
  heartbeatFrequencyMS: 10000, // How often to send a heartbeat to check connection status
  retryReads: true, // Retry reads upon network errors
})
  .then(async () => {
    console.log('✅ Connected to MongoDB with optimized settings');
    // Create database indexes for performance
    await createIndexes();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log('✅ CORS enabled for:', allowedOrigins);
});