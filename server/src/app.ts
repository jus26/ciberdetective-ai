import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { apiLimiter } from './middleware/rateLimitMiddleware.ts';
import authRoutes from './routes/authRoutes.ts';
import debateRoutes from './routes/debateRoutes.ts';
import gamificationRoutes from './routes/gamificationRoutes.ts';
import missionRoutes from './routes/missionRoutes.ts';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // Seguridad HTTP
  app.use(helmet());

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origen no permitido por política CORS.'));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      servicio: 'CiberDetective AI Backend',
      database:
        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/missions', missionRoutes);
  app.use('/api/gamification', gamificationRoutes);
  app.use('/api/debates', debateRoutes);

  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada.' });
  });

  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      console.error('[Express Error]', err.message);
      res.status(500).json({
        ok: false,
        error: err.message || 'Error interno del servidor.',
      });
    }
  );

  return app;
}
