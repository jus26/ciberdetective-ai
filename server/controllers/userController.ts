import type { Request, Response } from 'express';
import {
  sanitizePublicUser,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';
import { dataStore } from '../services/dataStore.ts';
import { computeLevelFromXp } from '../services/gamificationService.ts';

export async function getLeaderboard(_req: Request, res: Response): Promise<void> {
  const leaderboard = await dataStore.getLeaderboard(25);
  res.json({ leaderboard });
}

export async function getAchievementsCatalog(
  _req: Request,
  res: Response
): Promise<void> {
  const achievements = await dataStore.listAchievements();
  res.json({ achievements });
}

export async function getPlatformSummary(
  _req: Request,
  res: Response
): Promise<void> {
  const stats = await dataStore.getPlatformStats();
  res.json({ stats });
}

export async function getPlayerProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.currentUser) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  const [achievements, attempts] = await Promise.all([
    dataStore.listAchievements(),
    dataStore.getUserAttempts(req.currentUser.id, 10),
  ]);

  const levelInfo = computeLevelFromXp(req.currentUser.xp);
  const accuracy =
    req.currentUser.missionsCompleted > 0
      ? Math.round(
          (req.currentUser.missionsCorrect / req.currentUser.missionsCompleted) * 100
        )
      : 0;

  res.json({
    profile: {
      ...sanitizePublicUser(req.currentUser),
      rankTitle: levelInfo.rank,
      nextLevelXp: levelInfo.nextLevelXp,
      currentMinXp: levelInfo.currentMinXp,
      accuracy,
    },
    achievements,
    recentAttempts: attempts,
  });
}

export async function getPlayerHistory(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.currentUser) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  const attempts = await dataStore.getUserAttempts(req.currentUser.id, 50);
  res.json({ history: attempts });
}
