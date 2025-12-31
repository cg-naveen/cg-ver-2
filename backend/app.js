import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

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

// === ALLOWED ORIGINS ===
const allowedOrigins = [
  'http://localhost:3000',          // local dev
  'https://cg-ver-2.vercel.app',    // production frontend
];

// === MIDDLEWARE ===
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server requests
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy does not allow this origin'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// === RATE LIMITER FOR AUTH ===
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip, 
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
