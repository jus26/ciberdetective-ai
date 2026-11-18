import type { StoredAchievement, StoredUser } from './dataStore.ts';
import type { MissionCategory } from '../models/Mission.ts';

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, rank: 'Analista Júnior' },
  { level: 2, minXp: 250, rank: 'Investigador Digital' },
  { level: 3, minXp: 600, rank: 'Especialista SOC' },
  { level: 4, minXp: 1100, rank: 'Perito Forense' },
  { level: 5, minXp: 1800, rank: 'Delegado de Cumplimiento' },
  { level: 6, minXp: 2800, rank: 'Director de Ciberinteligencia' },
] as const;

export function computeLevelFromXp(xp: number): {
  level: number;
  rank: string;
  currentMinXp: number;
  nextLevelXp: number | null;
} {
  let active: (typeof LEVEL_THRESHOLDS)[number] = LEVEL_THRESHOLDS[0];
  let next: (typeof LEVEL_THRESHOLDS)[number] | null = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp) {
      active = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] ?? null;
    }
  }

  return {
    level: active.level,
    rank: active.rank,
    currentMinXp: active.minXp,
    nextLevelXp: next ? next.minXp : null,
  };
}

export function evaluateNewAchievements(
  user: StoredUser,
  allAchievements: StoredAchievement[],
  context: { isCorrect: boolean; hasDetailedJustification: boolean }
): { newlyUnlocked: StoredAchievement[]; bonusXp: number } {
  const already = new Set(user.unlockedAchievements);
  const newlyUnlocked: StoredAchievement[] = [];

  const check = (code: string, condition: boolean) => {
    if (!already.has(code) && condition) {
      const found = allAchievements.find((a) => a.code === code);
      if (found) {
        newlyUnlocked.push(found);
        already.add(code);
      }
    }
  };

  check('FIRST_CASE', user.missionsCorrect >= 1);
  check('PHISHING_HUNTER', user.categoryStats.phishingSolved >= 2);
  check('PRIVACY_GUARDIAN', user.categoryStats.privacySolved >= 2);
  check('DIGITAL_JURIST', user.categoryStats.digitalLawSolved >= 2);
  check('STREAK_3', user.bestStreak >= 3);
  check(
    'ANALYST_ARGUMENTS',
    context.isCorrect && context.hasDetailedJustification
  );
  check('SOC_SENIOR', user.level >= 3);
  check(
    'FULL_SPECTRUM',
    user.categoryStats.phishingSolved >= 1 &&
      user.categoryStats.privacySolved >= 1 &&
      user.categoryStats.digitalLawSolved >= 1
  );

  const bonusXp = newlyUnlocked.reduce((acc, a) => acc + a.xpBonus, 0);
  return { newlyUnlocked, bonusXp };
}

export function updateCategoryStats(
  stats: StoredUser['categoryStats'],
  category: MissionCategory
): StoredUser['categoryStats'] {
  return {
    phishingSolved:
      category === 'phishing' ? stats.phishingSolved + 1 : stats.phishingSolved,
    privacySolved:
      category === 'privacy' ? stats.privacySolved + 1 : stats.privacySolved,
    digitalLawSolved:
      category === 'digital_law'
        ? stats.digitalLawSolved + 1
        : stats.digitalLawSolved,
  };
}
