import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from './server/config/database.ts';
import { env } from './server/config/env.ts';
import { generalApiLimiter } from './server/middleware/rateLimit.ts';
import apiRouter from './server/routes/index.ts';
import { initializeSeedData } from './server/services/dataStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDatabase();
  await initializeSeedData();

  const app = express();

  // Trust proxy for Render / Cloud Run rate limiting accuracy
  app.set('trust proxy', 1);

  // Security headers compatible with Vite dev & iframe preview
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', generalApiLimiter, apiRouter);

  if (!env.isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log(
      `[Server] CiberDetective AI escuchando en http://0.0.0.0:${env.port} (${env.nodeEnv})`
    );
  });
}

startServer().catch((err) => {
  console.error('[Fatal] Error al iniciar el servidor:', err);
  process.exit(1);
});
