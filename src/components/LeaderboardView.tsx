import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { LeaderboardEntry } from '../types';

export function LeaderboardView() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .getLeaderboard()
      .then((res) => {
        if (mounted) setEntries(res.leaderboard);
      })
      .catch((err) => {
        if (mounted)
          setError(err?.message || 'Error al cargar la clasificación.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="border-b border-slate-800/90 pb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Clasificación global de detectives
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Ordenada por puntuación acumulada, experiencia y precisión en la
            resolución de casos.
          </p>
        </div>
        <Trophy className="w-6 h-6 text-emerald-400 shrink-0" />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-12 rounded-lg border border-slate-800 bg-[#0B1324] animate-pulse"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-12 text-center">
          <p className="text-sm text-slate-300">
            Aún no hay puntuaciones registradas.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B1324]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070E1D] text-xs font-medium text-slate-400">
                <th className="py-3.5 px-5">Posición</th>
                <th className="py-3.5 px-5">Detective</th>
                <th className="py-3.5 px-5 text-right">Nivel</th>
                <th className="py-3.5 px-5 text-right">XP</th>
                <th className="py-3.5 px-5 text-right">Casos resueltos</th>
                <th className="py-3.5 px-5 text-right">Precisión</th>
                <th className="py-3.5 px-5 text-right">Puntuación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {entries.map((row) => {
                const isCurrentUser = user?.id === row.userId;
                return (
                  <tr
                    key={row.userId}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-950/25'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono tabular-nums font-semibold text-slate-300">
                      #{row.rank}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-white">
                      {row.codename}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-emerald-400">
                          (Tú)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums text-slate-300">
                      {row.level}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums text-slate-300">
                      {row.xp}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums text-slate-300">
                      {row.missionsSolved}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums text-slate-300">
                      {row.accuracy}%
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums font-bold text-emerald-400">
                      {row.totalPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
