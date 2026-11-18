import { Award, Flame, RefreshCw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { LEVEL_RANKS, type RankingEntry } from '../types';

export function Leaderboard() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getRanking(25);
      setRanking(res.ranking);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar la clasificación global.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10b981] mb-1">
            <Trophy className="w-4 h-4" />
            <span>Clasificación Global SOC</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            Mejores CiberDetectives
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Ordenados en tiempo real por experiencia acumulada, rango operativo,
            insignias y tasa de acierto.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRanking}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0a0f1c] px-4 py-2 text-xs font-medium text-slate-200 hover:border-[#10b981] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar ranking</span>
        </button>
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
              className="h-14 rounded-lg border border-slate-800 bg-[#0a0f1c] animate-pulse"
            />
          ))}
        </div>
      ) : ranking.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-12 text-center text-sm text-slate-400">
          Todavía no hay agentes clasificados en la plataforma.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0a0f1c]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#05080f] text-xs font-medium text-slate-400">
                <th className="py-3.5 px-5">Posición</th>
                <th className="py-3.5 px-5">CiberDetective</th>
                <th className="py-3.5 px-5">Rango</th>
                <th className="py-3.5 px-5">Insignias destacadas</th>
                <th className="py-3.5 px-5 text-right">Racha</th>
                <th className="py-3.5 px-5 text-right">Acierto</th>
                <th className="py-3.5 px-5 text-right">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {ranking.map((entry) => {
                const isMe = user?.id === entry.userId;
                const rankTitle =
                  (LEVEL_RANKS[entry.nivel] || LEVEL_RANKS[6]).titulo;

                return (
                  <tr
                    key={entry.userId}
                    className={
                      isMe
                        ? 'bg-[#10b981]/10'
                        : 'hover:bg-slate-900/40 transition-colors'
                    }
                  >
                    <td className="py-4 px-5 font-mono tabular-nums font-bold text-slate-300">
                      #{entry.posicion}
                    </td>
                    <td className="py-4 px-5 font-semibold text-white">
                      {entry.nombre}
                      {isMe && (
                        <span className="ml-2 text-xs font-normal text-[#10b981]">
                          (Tú)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-300">
                      Nv. {entry.nivel} · {rankTitle}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-300">
                      {entry.insignias.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                          <span>
                            {entry.insignias
                              .slice(0, 2)
                              .map((b) => b.nombre)
                              .join(' · ')}
                            {entry.insignias.length > 2
                              ? ` (+${entry.insignias.length - 2})`
                              : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin insignias aún</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right font-mono tabular-nums text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        {entry.rachaDias}d
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-mono tabular-nums text-slate-200">
                      {entry.tasaAcierto}%
                    </td>
                    <td className="py-4 px-5 text-right font-mono tabular-nums font-bold text-[#10b981]">
                      {entry.xp}
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
