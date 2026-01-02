import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/booking.js';
import paymentRoutes from './routes/payments.js';
import userRoutes from './routes/users.js';
import adminDashboardRoutes from './routes/adminDashboard.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://cg-ver-2.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, curl, Vercel checks
    if (!origin) return callback(null, true);

    // Allow exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview subdomains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    console.error('Blocked by CORS:', origin);
    return callback(null, false); // ❗ NEVER throw
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// === RATE LIMITER FOR AUTH ===
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: ipKeyGenerator,
});

app.use('/api/auth', authLimiter);

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminDashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
