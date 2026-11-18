import mongoose from 'mongoose';

let isListenersAttached = false;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = (process.env.MONGODB_URI || '').trim();

  if (!uri) {
    throw new Error(
      'Falta la variable de entorno MONGODB_URI para conectar con MongoDB Atlas.'
    );
  }

  if (!isListenersAttached) {
    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Conexión establecida con MongoDB Atlas.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Error de conexión:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Conexión cerrada o interrumpida.');
    });

    isListenersAttached = true;
  }

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
