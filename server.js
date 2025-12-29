import express from 'express';
import cors from 'cors';
import pool from './db.js';
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
import adminDashboardRoutes from './routes/adminDashboard.js'

dotenv.config();

const app = express();

// === MIDDLEWARE ===
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// === RATE LIMITER FOR AUTH ===
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
app.use('/api/auth', authLimiter);

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/hotels', hotelRoutes);
app.use('/rooms', roomRoutes);
app.use('/services', serviceRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);
app.use("/admin", adminDashboardRoutes);

app.get('/', (req, res) => {
  res.send('server running successfully');
});

// === START SERVER ===
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
