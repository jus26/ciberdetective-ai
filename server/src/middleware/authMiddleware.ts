import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, type IUser, type UserRole } from '../models/User.ts';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  sub: string;
  rol: UserRole;
}

function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      'JWT_SECRET no está configurado o es demasiado corto (mínimo 16 caracteres).'
    );
  }
  return secret;
}

export function generateJwtToken(user: IUser): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(
    { sub: String(user._id), rol: user.rol } satisfies JwtPayload,
    getJwtSecret(),
    { expiresIn }
  );
}

export async function protect(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        ok: false,
        error: 'Acceso no autorizado. Falta el token de autenticación.',
      });
      return;
    }

    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(401).json({
        ok: false,
        error: 'El usuario asociado a este token ya no existe.',
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado.',
    });
  }
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
      const user = await User.findById(decoded.sub);
      if (user) req.user = user;
    }
  } catch {
    // Continuar como invitado
  }
  next();
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }
    if (!roles.includes(req.user.rol)) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permisos suficientes para realizar esta acción.',
      });
      return;
    }
    next();
  };
}
