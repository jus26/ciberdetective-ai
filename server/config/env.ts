import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const runtimeFallbackJwtSecret = crypto.randomBytes(32).toString('hex');

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: (process.env.MONGODB_URI || '').trim(),
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  jwtSecret:
    (process.env.JWT_SECRET || '').trim().length >= 16
      ? (process.env.JWT_SECRET || '').trim()
      : runtimeFallbackJwtSecret,
  hasConfiguredJwtSecret: (process.env.JWT_SECRET || '').trim().length >= 16,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
} as const;
