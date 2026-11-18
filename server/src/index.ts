import dotenv from 'dotenv';
import { createApp } from './app.ts';
import { connectDB } from './config/db.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function bootstrap() {
  await connectDB();

  const app = createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[CiberDetective AI] Servidor backend activo en http://0.0.0.0:${PORT}`
    );
  });
}

bootstrap().catch((err) => {
  console.error('[Fatal] No se pudo iniciar el servidor backend:', err);
  process.exit(1);
});
