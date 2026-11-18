import { Attempt } from '../models/Attempt.ts';
import { Badge, type IBadge } from '../models/Badge.ts';
import type { IUser } from '../models/User.ts';

export function calculateLevelFromXp(xp: number): number {
  if (xp >= 3000) return 6;
  if (xp >= 1800) return 5;
  if (xp >= 1100) return 4;
  if (xp >= 600) return 3;
  if (xp >= 250) return 2;
  return 1;
}

export function calculateNextSpacedRepetitionDate(aprobado: boolean): Date | null {
  if (aprobado) return null;
  // Programar alerta de repetición espaciada en 24 horas para reforzar el aprendizaje
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function updateDailyStreak(user: IUser): void {
  const now = new Date();
  const last = user.ultimaConexion ? new Date(user.ultimaConexion) : null;

  if (!last) {
    user.rachaDias = 1;
    user.ultimaConexion = now;
    return;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfLast.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (diffDays === 1) {
    user.rachaDias += 1;
  } else if (diffDays > 1) {
    user.rachaDias = 1;
  }
  user.ultimaConexion = now;
}

export async function unlockEligibleBadges(user: IUser): Promise<IBadge[]> {
  const [allBadges, passedAttempts] = await Promise.all([
    Badge.find().lean<IBadge[]>(),
    Attempt.find({ userId: user._id, aprobado: true })
      .populate('missionId', 'categoria')
      .lean(),
  ]);

  const ownedSet = new Set(user.insignias.map((id) => String(id)));

  // Distinct passed missions & categories
  const uniquePassedMissions = new Set<string>();
  const uniqueByCategory: Record<string, Set<string>> = {
    phishing: new Set<string>(),
    privacidad: new Set<string>(),
    derecho_digital: new Set<string>(),
    forense: new Set<string>(),
  };
  let maxScore = 0;

  for (const att of passedAttempts as any[]) {
    const mId = String(att.missionId?._id || att.missionId);
    uniquePassedMissions.add(mId);
    const cat = att.missionId?.categoria;
    if (cat && uniqueByCategory[cat]) {
      uniqueByCategory[cat].add(mId);
    }
    if (att.puntuacionObtenida > maxScore) {
      maxScore = att.puntuacionObtenida;
    }
  }

  const newlyUnlocked: IBadge[] = [];

  for (const badge of allBadges) {
    const badgeIdStr = String(badge._id);
    if (ownedSet.has(badgeIdStr)) continue;

    let meetsCondition = false;
    switch (badge.condicionTipo) {
      case 'misiones_aprobadas':
        meetsCondition = uniquePassedMissions.size >= badge.condicionValor;
        break;
      case 'categoria_phishing':
        meetsCondition = uniqueByCategory.phishing.size >= badge.condicionValor;
        break;
      case 'categoria_privacidad':
        meetsCondition = uniqueByCategory.privacidad.size >= badge.condicionValor;
        break;
      case 'categoria_derecho_digital':
        meetsCondition =
          uniqueByCategory.derecho_digital.size >= badge.condicionValor;
        break;
      case 'categoria_forense':
        meetsCondition = uniqueByCategory.forense.size >= badge.condicionValor;
        break;
      case 'racha_dias':
        meetsCondition = user.rachaDias >= badge.condicionValor;
        break;
      case 'nivel_alcanzado':
        meetsCondition = user.nivel >= badge.condicionValor;
        break;
      case 'puntuacion_minima':
        meetsCondition = maxScore >= badge.condicionValor;
        break;
    }

    if (meetsCondition) {
      user.insignias.push(badge._id as any);
      ownedSet.add(badgeIdStr);
      newlyUnlocked.push(badge);
    }
  }

  if (newlyUnlocked.length > 0) {
    await user.save();
  }

  return newlyUnlocked;
}
