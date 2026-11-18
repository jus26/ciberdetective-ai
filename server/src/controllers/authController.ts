import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/authMiddleware.ts';
import { generateJwtToken } from '../middleware/authMiddleware.ts';
import { Attempt } from '../models/Attempt.ts';
import { User, type IUser } from '../models/User.ts';
import { updateDailyStreak } from '../services/gamificationService.ts';

export const registerSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(60, 'El nombre no puede superar los 60 caracteres.'),
  email: z.string().trim().email('Correo electrónico inválido.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La contraseña es demasiado larga.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Correo electrónico inválido.'),
  password: z.string().min(1, 'Debes introducir tu contraseña.'),
});

function formatPublicUser(user: IUser) {
  return {
    id: user._id,
    nombre: user.nombre,
    email: user.email,
    nivel: user.nivel,
    xp: user.xp,
    rachaDias: user.rachaDias,
    ultimaConexion: user.ultimaConexion,
    insignias: user.insignias,
    rol: user.rol,
    createdAt: user.createdAt,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, email, password } = req.body as z.infer<typeof registerSchema>;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(409).json({
        ok: false,
        error: 'Ya existe una cuenta registrada con ese correo electrónico.',
      });
      return;
    }

    const user = await User.create({
      nombre,
      email: email.toLowerCase(),
      password,
      rol: 'user',
    });

    const token = generateJwtToken(user);
    res.status(201).json({
      ok: true,
      token,
      user: formatPublicUser(user),
    });
  } catch (err) {
    console.error('[Auth Register]', err);
    res.status(500).json({ ok: false, error: 'Error al registrar el usuario.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({ ok: false, error: 'Credenciales incorrectas.' });
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ ok: false, error: 'Credenciales incorrectas.' });
      return;
    }

    updateDailyStreak(user);
    await user.save();
    await user.populate('insignias');

    const token = generateJwtToken(user);
    res.json({
      ok: true,
      token,
      user: formatPublicUser(user),
    });
  } catch (err) {
    console.error('[Auth Login]', err);
    res.status(500).json({ ok: false, error: 'Error al iniciar sesión.' });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'No autenticado.' });
      return;
    }

    const user = await User.findById(req.user._id).populate('insignias');
    if (!user) {
      res.status(404).json({ ok: false, error: 'Usuario no encontrado.' });
      return;
    }

    const [totalAttempts, approvedAttempts] = await Promise.all([
      Attempt.countDocuments({ userId: user._id }),
      Attempt.countDocuments({ userId: user._id, aprobado: true }),
    ]);

    res.json({
      ok: true,
      user: formatPublicUser(user),
      estadisticas: {
        intentosTotales: totalAttempts,
        misionesAprobadas: approvedAttempts,
        tasaAcierto:
          totalAttempts > 0
            ? Math.round((approvedAttempts / totalAttempts) * 100)
            : 0,
      },
    });
  } catch (err) {
    console.error('[Auth Profile]', err);
    res.status(500).json({ ok: false, error: 'Error al obtener el perfil.' });
  }
}
