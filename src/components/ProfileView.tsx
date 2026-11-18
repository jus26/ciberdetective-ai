import {
  Award,
  Compass,
  FileSearch,
  Flame,
  Lock,
  LogOut,
  MailWarning,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { AchievementItem, UserProfile } from '../types';

interface ProfileViewProps {
  onLogout: () => void;
  onGoToMissions: () => void;
}

const ACHIEVEMENT_ICONS: Record<string, typeof Award> = {
  'shield-check': ShieldCheck,
  'mail-warning': MailWarning,
  lock: Lock,
  scale: Scale,
  flame: Flame,
  'file-search': FileSearch,
  award: Award,
  compass: Compass,
};

export function ProfileView({ onLogout, onGoToMissions }: ProfileViewProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .getProfile()
      .then((res) => {
        if (!mounted) return;
        setProfile(res.profile);
        setAchievements(res.achievements);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return null;

  const currentMin = profile.currentMinXp ?? 0;
  const nextXp = profile.nextLevelXp;
  const progressPercent =
    nextXp && nextXp > currentMin
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(((profile.xp - currentMin) / (nextXp - currentMin)) * 100)
          )
        )
      : 100;

  const accuracy =
    profile.missionsCompleted > 0
      ? Math.round((profile.missionsCorrect / profile.missionsCompleted) * 100)
      : 0;

  const unlockedSet = new Set(profile.unlockedAchievements);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Header & Logout */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/90 pb-6">
        <div>
          <p className="text-xs text-emerald-400 font-medium mb-1">
            Expediente del detective · {profile.role === 'admin' ? 'Administrador SOC' : 'Analista'}
          </p>
          <h1 className="font-display text-3xl font-bold text-white">
            {profile.codename}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {profile.rankTitle} · {profile.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoToMissions}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Resolver misiones
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0B1324] px-4 py-2 text-xs font-medium text-slate-200 hover:border-red-500/60 hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Level & XP Bar + Core Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B1324] p-6 space-y-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-slate-400">Nivel actual</p>
              <p className="font-display text-2xl font-bold text-white mt-0.5 tabular-nums">
                Nivel {profile.level} · {profile.rankTitle}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
              {profile.xp} XP
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#050A14] border border-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
              <span>{progressPercent}% del nivel</span>
              <span>
                {nextXp
                  ? `Faltan ${Math.max(0, nextXp - profile.xp)} XP para Nivel ${profile.level + 1}`
                  : 'Rango máximo alcanzado'}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
            <p className="text-xs text-slate-400">Puntuación total</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {profile.totalScore}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
            <p className="text-xs text-slate-400">Casos acertados</p>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {profile.missionsCorrect}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
            <p className="text-xs text-slate-400">Precisión</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {accuracy}%
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
            <p className="text-xs text-slate-400">Mejor racha</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {profile.bestStreak}
            </p>
          </div>
        </div>
      </div>

      {/* Category Specialization */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">
          Especialización por rama
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs text-slate-400">Phishing y Estafas</p>
            <p className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">
              {profile.categoryStats.phishingSolved} casos resueltos
            </p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs text-slate-400">Protección de Datos y Privacidad</p>
            <p className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">
              {profile.categoryStats.privacySolved} casos resueltos
            </p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs text-slate-400">Derecho Digital Español y Europeo</p>
            <p className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">
              {profile.categoryStats.digitalLawSolved} casos resueltos
            </p>
          </div>
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-white">
            Insignias y logros
          </h2>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {profile.unlockedAchievements.length} / {achievements.length} desbloqueados
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-32 rounded-xl border border-slate-800 bg-[#0B1324] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => {
              const unlocked = unlockedSet.has(ach.code);
              const Icon = ACHIEVEMENT_ICONS[ach.iconKey] || Award;
              return (
                <div
                  key={ach.code}
                  className={`rounded-xl border p-5 transition-colors ${
                    unlocked
                      ? 'border-emerald-500/40 bg-[#0B1324]'
                      : 'border-slate-800/80 bg-[#070D1B]/70 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon
                      className={`w-5 h-5 ${
                        unlocked ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        unlocked ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      +{ach.xpBonus} XP
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white">
                    {ach.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>
                  <p className="mt-3 text-[11px] font-medium text-slate-400">
                    {unlocked ? 'Desbloqueado' : 'Pendiente'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
