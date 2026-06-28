import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import userRoutes from './routes/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

// Matches any Vercel preview/production deployment for this project
const VERCEL_ORIGIN_RE = /^https:\/\/attendance-tracker(-[a-z0-9]+)*(-srikar025s-projects)?\.vercel\.app$/;

// Extra origins from env var (comma-separated) for flexibility
const extraOrigins = FRONTEND_URL.split(',').map((u) => u.trim()).filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl requests (no Origin header)
    if (!origin) return callback(null, true);
    if (
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:3001' ||
      origin === 'http://localhost:5173' ||
      VERCEL_ORIGIN_RE.test(origin) ||
      extraOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

export default app;
