import type { Response } from 'express';
import { z } from 'zod';
import {
  sanitizePublicUser,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';
import { dataStore, type StoredMission } from '../services/dataStore.ts';
import {
  computeLevelFromXp,
  evaluateNewAchievements,
  updateCategoryStats,
} from '../services/gamificationService.ts';
import { generateMissionAnalysis } from '../services/geminiService.ts';

function sanitizeMissionForPlayer(mission: StoredMission, solved = false) {
  return {
    id: mission.id,
    slug: mission.slug,
    title: mission.title,
    category: mission.category,
    difficulty: mission.difficulty,
    xpReward: mission.xpReward,
    basePoints: mission.basePoints,
    brief: mission.brief,
    artifactType: mission.artifactType,
    artifactData: {
      sender: mission.artifactData.sender,
      recipient: mission.artifactData.recipient,
      subject: mission.artifactData.subject,
      headers: mission.artifactData.headers,
      body: mission.artifactData.body,
      metadata: mission.artifactData.metadata,
    },
    question: mission.question,
    options: mission.options,
    solved,
  };
}

const submitSchema = z.object({
  selectedOptionId: z
    .string()
    .trim()
    .min(1, 'Debes seleccionar una opción de respuesta.'),
  userJustification: z
    .string()
    .trim()
    .max(800, 'La justificación no puede superar los 800 caracteres.')
    .optional()
    .default(''),
});

export async function listMissions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const missions = await dataStore.listMissions(false);
  let solvedSet = new Set<string>();

  if (req.currentUser) {
    const attempts = await dataStore.getUserAttempts(req.currentUser.id, 200);
    solvedSet = new Set(
      attempts.filter((a) => a.isCorrect).map((a) => a.missionId)
    );
  }

  res.json({
    missions: missions.map((m) =>
      sanitizeMissionForPlayer(m, solvedSet.has(m.id))
    ),
  });
}

export async function getMissionById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const missionId = String(req.params.id || '');
  const mission = await dataStore.findMissionById(missionId);
  if (!mission || !mission.isActive) {
    res.status(404).json({ error: 'Misión no encontrada o inactiva.' });
    return;
  }

  let solved = false;
  if (req.currentUser) {
    solved = await dataStore.hasUserSolvedMission(req.currentUser.id, mission.id);
  }

  res.json({ mission: sanitizeMissionForPlayer(mission, solved) });
}

export async function submitMissionAnswer(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Debes iniciar sesión para resolver misiones.' });
    return;
  }

  const missionId = String(req.params.id || '');
  const mission = await dataStore.findMissionById(missionId);
  if (!mission || !mission.isActive) {
    res.status(404).json({ error: 'Misión no encontrada o inactiva.' });
    return;
  }

  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Respuesta inválida.',
    });
    return;
  }

  const { selectedOptionId, userJustification } = parsed.data;
  const selectedOption = mission.options.find((o) => o.id === selectedOptionId);
  if (!selectedOption) {
    res.status(400).json({ error: 'La opción seleccionada no pertenece a esta misión.' });
    return;
  }

  const isCorrect = selectedOptionId === mission.correctOptionId;

  // Call Gemini API on server side to evaluate and explain
  let aiAnalysis;
  try {
    aiAnalysis = await generateMissionAnalysis({
      mission,
      selectedOptionId,
      userJustification,
      isCorrect,
    });
  } catch (err: any) {
    console.error('[Gemini Error]', err);
    const status = err?.status === 429 ? 429 : 502;
    res.status(status).json({
      error:
        err?.message ||
        'No se pudo generar la evaluación con Gemini en este momento. Verifica la configuración de GEMINI_API_KEY e inténtalo de nuevo.',
    });
    return;
  }

  const user = req.currentUser;
  const alreadySolvedBefore = await dataStore.hasUserSolvedMission(
    user.id,
    mission.id
  );
  const hasDetailedJustification = userJustification.trim().length >= 30;

  let xpEarned = 0;
  let pointsEarned = 0;

  if (isCorrect) {
    if (!alreadySolvedBefore) {
      xpEarned = mission.xpReward + (hasDetailedJustification ? 25 : 0);
      pointsEarned = mission.basePoints + (hasDetailedJustification ? 30 : 0);
    } else {
      // Practice replay awards small XP only, no infinite score farming
      xpEarned = 15;
      pointsEarned = 0;
    }
  } else {
    // Effort XP for attempting and learning
    xpEarned = 15;
    pointsEarned = 0;
  }

  const newStreak = isCorrect ? user.streak + 1 : 0;
  const newBestStreak = Math.max(user.bestStreak, newStreak);
  const newMissionsCompleted = user.missionsCompleted + 1;
  const newMissionsCorrect =
    isCorrect && !alreadySolvedBefore
      ? user.missionsCorrect + 1
      : user.missionsCorrect;

  const newCategoryStats =
    isCorrect && !alreadySolvedBefore
      ? updateCategoryStats(user.categoryStats, mission.category)
      : user.categoryStats;

  const provisionalXp = user.xp + xpEarned;
  const provisionalLevel = computeLevelFromXp(provisionalXp).level;

  const provisionalUser = {
    ...user,
    xp: provisionalXp,
    level: provisionalLevel,
    totalScore: user.totalScore + pointsEarned,
    missionsCompleted: newMissionsCompleted,
    missionsCorrect: newMissionsCorrect,
    streak: newStreak,
    bestStreak: newBestStreak,
    categoryStats: newCategoryStats,
  };

  const allAchievements = await dataStore.listAchievements();
  const { newlyUnlocked, bonusXp } = evaluateNewAchievements(
    provisionalUser,
    allAchievements,
    { isCorrect, hasDetailedJustification }
  );

  const finalXp = provisionalXp + bonusXp;
  const finalLevelInfo = computeLevelFromXp(finalXp);
  const finalUnlockedIds = [
    ...user.unlockedAchievements,
    ...newlyUnlocked.map((a) => a.code),
  ];

  const updatedUser = await dataStore.updateUserProgress(user.id, {
    xp: finalXp,
    level: finalLevelInfo.level,
    totalScore: provisionalUser.totalScore,
    missionsCompleted: newMissionsCompleted,
    missionsCorrect: newMissionsCorrect,
    streak: newStreak,
    bestStreak: newBestStreak,
    categoryStats: newCategoryStats,
    unlockedAchievements: finalUnlockedIds,
  });

  const attempt = await dataStore.createAttempt({
    userId: user.id,
    missionId: mission.id,
    missionTitle: mission.title,
    missionCategory: mission.category,
    selectedOptionId,
    selectedOptionText: selectedOption.text,
    correctOptionId: mission.correctOptionId,
    userJustification,
    isCorrect,
    pointsEarned,
    xpEarned: xpEarned + bonusXp,
    aiAnalysis,
  });

  res.json({
    attempt,
    isCorrect,
    correctOptionId: mission.correctOptionId,
    referenceSolution: mission.referenceSolution,
    legalContext: mission.legalContext,
    suspiciousIndicators: mission.artifactData.suspiciousIndicators || [],
    rewards: {
      pointsEarned,
      xpEarned: xpEarned + bonusXp,
      alreadySolvedBefore,
      newlyUnlocked,
    },
    user: updatedUser
      ? {
          ...sanitizePublicUser(updatedUser),
          rankTitle: finalLevelInfo.rank,
          nextLevelXp: finalLevelInfo.nextLevelXp,
          currentMinXp: finalLevelInfo.currentMinXp,
        }
      : null,
  });
}
