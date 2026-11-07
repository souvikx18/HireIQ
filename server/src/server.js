import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';
import { sendSuccess, sendError } from './utils/response.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportRoutes from './routes/report.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import skillRoutes from './routes/skill.routes.js';
import candidatePortalRoutes from './routes/candidatePortal.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// 1. Response Compression (gzip / deflate) for production efficiency
app.use(compression());

// 2. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Flexible Production & Development CORS
const allowedOrigins = (config.clientUrl || '').split(',').map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        config.clientUrl === '*' ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: origin ${origin} is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});
app.use('/api', globalLimiter);

// 5. Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 6. Health Check Endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (err) {
    logger.error('Health check database error:', err);
    return sendError(res, 'Database connection error', 503);
  }
});

// 7. Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/candidate-portal', candidatePortalRoutes);

// 8. Production Static Frontend Delivery (Unified Deployment Mode)
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 9. API 404 Route Handler
app.use('/api/*', (req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// 10. Centralized Error Handler
app.use(errorHandler);

// 11. Server Initialization & Graceful Shutdown
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, () => {
    logger.info(`🚀 HireIQ Backend Server listening on port ${config.port} (${config.env})`);
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} signal received: closing HTTP server and database connections...`);
    server.close(async () => {
      logger.info('HTTP server closed cleanly.');
      try {
        await prisma.$disconnect();
        logger.info('Prisma database client disconnected.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during database disconnect:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
