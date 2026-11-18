import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { dataStore, type StoredUser } from '../services/dataStore.ts';

export interface AuthJwtPayload {
  sub: string;
  role: 'player' | 'admin';
  codename: string;
}

export interface AuthenticatedRequest extends Request {
  currentUser?: StoredUser;
}

export function signAuthToken(user: StoredUser): string {
  const payload: AuthJwtPayload = {
    sub: user.id,
    role: user.role,
    codename: user.codename,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function sanitizePublicUser(user: StoredUser) {
  return {
    id: user.id,
    codename: user.codename,
    email: user.email,
    role: user.role,
    xp: user.xp,
    level: user.level,
    totalScore: user.totalScore,
    missionsCompleted: user.missionsCompleted,
    missionsCorrect: user.missionsCorrect,
    streak: user.streak,
    bestStreak: user.bestStreak,
    unlockedAchievements: user.unlockedAchievements,
    categoryStats: user.categoryStats,
    createdAt: user.createdAt,
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autenticación requerida. Inicia sesión para continuar.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
    const user = await dataStore.findUserById(decoded.sub);
    if (!user) {
      res.status(401).json({ error: 'Sesión inválida o usuario no encontrado.' });
      return;
    }
    req.currentUser = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token expirado o no válido.' });
  }
}

export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
      const user = await dataStore.findUserById(decoded.sub);
      if (user) {
        req.currentUser = user;
      }
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Autenticación requerida.' });
    return;
  }
  if (req.currentUser.role !== 'admin') {
    res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administración.',
    });
    return;
  }
  next();
}
