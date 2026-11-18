import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.ts';
import { Attempt } from '../models/Attempt.ts';
import { Badge } from '../models/Badge.ts';
import { User } from '../models/User.ts';
import { unlockEligibleBadges } from '../services/gamificationService.ts';

export async function getGlobalRanking(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit || 25), 100);
    const players = await User.find()
      .sort({ xp: -1, nivel: -1, rachaDias: -1 })
      .limit(limit)
      .select('nombre nivel xp rachaDias insignias')
      .populate('insignias', 'codigo nombre icono');

    const userIds = players.map((p) => p._id);
    const attemptStats = await Attempt.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          intentosTotales: { $sum: 1 },
          misionesAprobadas: {
            $sum: { $cond: [{ $eq: ['$aprobado', true] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = new Map<
      string,
      { intentosTotales: number; misionesAprobadas: number }
    >();
    for (const s of attemptStats) {
      statsMap.set(String(s._id), {
        intentosTotales: s.intentosTotales,
        misionesAprobadas: s.misionesAprobadas,
      });
    }

    const ranking = players.map((u, idx) => {
      const st = statsMap.get(String(u._id));
      const intentos = st?.intentosTotales || 0;
      const aprobadas = st?.misionesAprobadas || 0;
      const tasaAcierto =
        intentos > 0 ? Math.round((aprobadas / intentos) * 100) : 0;

      return {
        posicion: idx + 1,
        userId: u._id,
        nombre: u.nombre,
        nivel: u.nivel,
        xp: u.xp,
        rachaDias: u.rachaDias,
        totalInsignias: u.insignias.length,
        insignias: u.insignias,
        misionesAprobadas: aprobadas,
        tasaAcierto,
      };
    });

    res.json({ ok: true, ranking });
  } catch (err) {
    console.error('[Global Ranking]', err);
    res.status(500).json({ ok: false, error: 'Error al obtener el ranking.' });
  }
}

export async function getUserAttemptsHistory(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const attempts = await Attempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('missionId', 'titulo categoria dificultad xpRecompensa');

    res.json({
      ok: true,
      historial: attempts,
    });
  } catch (err) {
    console.error('[User History]', err);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener el historial de partidas.',
    });
  }
}

export async function getPendingSpacedRepetitionAlerts(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const includeUpcoming = req.query.incluirProximas === 'true';
    const filter: Record<string, unknown> = {
      userId: req.user._id,
      aprobado: false,
      fechaProximaAlerta: includeUpcoming
        ? { $ne: null }
        : { $ne: null, $lte: new Date() },
    };

    const alerts = await Attempt.find(filter)
      .sort({ fechaProximaAlerta: 1 })
      .populate('missionId', 'titulo categoria dificultad xpRecompensa');

    res.json({
      ok: true,
      alertasPendientes: alerts.map((a) => ({
        attemptId: a._id,
        mision: a.missionId,
        ultimaPuntuacion: a.puntuacionObtenida,
        fechaProximaAlerta: a.fechaProximaAlerta,
        vencida:
          a.fechaProximaAlerta !== null &&
          new Date(a.fechaProximaAlerta).getTime() <= Date.now(),
      })),
    });
  } catch (err) {
    console.error('[Pending Alerts]', err);
    res.status(500).json({
      ok: false,
      error: 'Error al consultar alertas de repetición espaciada.',
    });
  }
}

export async function getBadgesCatalog(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const badges = await Badge.find().sort({ condicionValor: 1 });
    const unlockedIds = new Set(
      (req.user?.insignias || []).map((id) => String(id))
    );

    res.json({
      ok: true,
      insignias: badges.map((b) => ({
        id: b._id,
        codigo: b.codigo,
        nombre: b.nombre,
        descripcion: b.descripcion,
        icono: b.icono,
        condicionTipo: b.condicionTipo,
        condicionValor: b.condicionValor,
        desbloqueada: unlockedIds.has(String(b._id)),
      })),
    });
  } catch (err) {
    console.error('[Badges Catalog]', err);
    res.status(500).json({ ok: false, error: 'Error al listar insignias.' });
  }
}

export async function evaluateBadges(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const nuevasInsignias = await unlockEligibleBadges(req.user);
    res.json({
      ok: true,
      nuevasInsignias,
      totalInsigniasUsuario: req.user.insignias.length,
    });
  } catch (err) {
    console.error('[Evaluate Badges]', err);
    res.status(500).json({
      ok: false,
      error: 'Error al evaluar desbloqueo de logros.',
    });
  }
}
