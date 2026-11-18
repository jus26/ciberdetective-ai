import mongoose from 'mongoose';
import { env } from './env.ts';

let usingMongoDb = false;

export async function connectDatabase(): Promise<boolean> {
  if (!env.mongodbUri) {
    console.warn(
      '[DB] MONGODB_URI no está definida. Ejecutando en modo de persistencia local JSON (ideal para pruebas; configura MONGODB_URI para MongoDB Atlas en producción).'
    );
    usingMongoDb = false;
    return false;
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 8000,
    });
    usingMongoDb = true;
    console.log('[DB] Conectado correctamente a MongoDB Atlas.');
    return true;
  } catch (error) {
    console.error('[DB] Error conectando a MongoDB Atlas:', error);
    usingMongoDb = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return usingMongoDb && mongoose.connection.readyState === 1;
}
