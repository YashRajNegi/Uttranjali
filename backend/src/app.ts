import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import { errorHandler, notFound } from './middleware/error';
import cors from 'cors';

dotenv.config();

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set.');
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const defaultAllowedOrigins = [
  'http://localhost:5000',
  'http://localhost:8080',
  'http://localhost:5173',
  'https://your-vercel-domain.vercel.app'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : defaultAllowedOrigins;

app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
}));

app.options('*', cors({
  origin: function (origin, callback) {
    console.log('CORS OPTIONS check:', origin); // Debug log
    if (!origin) {
      console.log('CORS OPTIONS allowed (no origin)');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log('CORS OPTIONS allowed:', origin);
      return callback(null, true);
    } else {
      console.log('CORS OPTIONS denied:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Test route to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling middleware should be last
app.use(notFound);
app.use(errorHandler);

export default app; 