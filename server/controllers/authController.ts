import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  sanitizePublicUser,
  signAuthToken,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';
import { dataStore } from '../services/dataStore.ts';
import { computeLevelFromXp } from '../services/gamificationService.ts';

const registerSchema = z.object({
  codename: z
    .string()
    .trim()
    .min(3, 'El alias de detective debe tener al menos 3 caracteres.')
    .max(28, 'El alias no puede superar los 28 caracteres.')
    .regex(
      /^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ -]+$/,
      'El alias contiene caracteres no permitidos.'
    ),
  email: z.string().trim().email('Introduce un correo electrónico válido.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La contraseña es demasiado larga.'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Introduce un correo electrónico válido.'),
  password: z.string().min(1, 'Introduce tu contraseña.'),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Datos de registro inválidos.',
    });
    return;
  }

  const { codename, email, password } = parsed.data;
  const existing = await dataStore.findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      error: 'Ya existe una cuenta registrada con ese correo electrónico.',
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const created = await dataStore.createUser({
    codename,
    email,
    passwordHash,
    role: 'player',
  });

  const token = signAuthToken(created);
  const levelInfo = computeLevelFromXp(created.xp);

  res.status(201).json({
    token,
    user: {
      ...sanitizePublicUser(created),
      rankTitle: levelInfo.rank,
      nextLevelXp: levelInfo.nextLevelXp,
      currentMinXp: levelInfo.currentMinXp,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Credenciales inválidas.',
    });
    return;
  }

  const { email, password } = parsed.data;
  const user = await dataStore.findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    return;
  }

  const token = signAuthToken(user);
  const levelInfo = computeLevelFromXp(user.xp);

  res.json({
    token,
    user: {
      ...sanitizePublicUser(user),
      rankTitle: levelInfo.rank,
      nextLevelXp: levelInfo.nextLevelXp,
      currentMinXp: levelInfo.currentMinXp,
    },
  });
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.currentUser) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  const levelInfo = computeLevelFromXp(req.currentUser.xp);
  res.json({
    user: {
      ...sanitizePublicUser(req.currentUser),
      rankTitle: levelInfo.rank,
      nextLevelXp: levelInfo.nextLevelXp,
      currentMinXp: levelInfo.currentMinXp,
    },
  });
}
