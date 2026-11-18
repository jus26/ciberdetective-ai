import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Leaf,
  Lock,
  MailWarning,
  RefreshCw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import {
  CATEGORIA_LABELS,
  DIFICULTAD_LABELS,
  type BadgeItem,
  type HistoryAttemptItem,
} from '../types';

interface ProfilePageProps {
  onPlayMission: (missionId: string) => void;
}

const BADGE_ICONS: Record<string, typeof Award> = {
  'shield-check': ShieldCheck,
  'mail-warning': MailWarning,
  lock: Lock,
  scale: Scale,
  'file-search': FileSearch,
  award: Award,
  leaf: Leaf,
  'refresh-cw': RefreshCw,
};

export function ProfilePage({ onPlayMission }: ProfilePageProps) {
  const { user, stats, rankInfo } = useAuth();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [history, setHistory] = useState<HistoryAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([apiClient.getBadges(), apiClient.getHistory()])
      .then(([badgesRes, historyRes]) => {
        if (!mounted) return;
        setBadges(badgesRes.insignias);
        setHistory(historyRes.historial);
        if (historyRes.historial.length > 0) {
          setExpandedAttemptId(historyRes.historial[0]._id);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err?.message || 'Error al cargar el expediente del agente.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;

  const unlockedCount = badges.filter((b) => b.desbloqueada).length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Cabecera del Expediente */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#10b981] mb-1">
            Expediente Oficial del Agente · {user.rol === 'admin' ? 'Administrador SOC' : 'Investigador'}
          </p>
          <h1 className="font-display text-3xl font-bold text-white">
            {user.nombre}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Nivel {user.nivel} · {rankInfo.titulo} · {user.email}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 text-right font-mono tabular-nums">
          <div>
            <p className="text-xs font-sans text-slate-400">Experiencia</p>
            <p className="text-xl font-bold text-[#10b981]">{user.xp} XP</p>
          </div>
          <div>
            <p className="text-xs font-sans text-slate-400">Racha</p>
            <p className="text-xl font-bold text-white">{user.rachaDias}d</p>
          </div>
          <div>
            <p className="text-xs font-sans text-slate-400">Acierto</p>
            <p className="text-xl font-bold text-white">
              {stats?.tasaAcierto ?? 0}%
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Vitrina de Insignias */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-white">
            Vitrina de insignias y logros
          </h2>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {unlockedCount} / {badges.length} desbloqueadas
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 rounded-xl border border-slate-800 bg-[#0a0f1c] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.icono] || Award;
              const unlocked = Boolean(badge.desbloqueada);
              return (
                <div
                  key={badge.codigo}
                  className={`rounded-xl border p-5 transition-colors ${
                    unlocked
                      ? 'border-[#10b981]/50 bg-[#0a0f1c]'
                      : 'border-slate-800/80 bg-[#05080f] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon
                      className={`w-5 h-5 ${
                        unlocked ? 'text-[#10b981]' : 'text-slate-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        unlocked ? 'text-[#10b981]' : 'text-slate-500'
                      }`}
                    >
                      {unlocked ? 'Desbloqueada' : 'Bloqueada'}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-white">
                    {badge.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {badge.descripcion}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial detallado de partidas pasadas con revisión de informes IA */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-white">
            Historial de partidas e informes de Gemini AI
          </h2>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {history.length} registros
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-24 rounded-xl border border-slate-800 bg-[#0a0f1c] animate-pulse"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-10 text-center text-sm text-slate-400">
            Aún no has completado ninguna partida. Resuelve tu primera misión en
            el Centro de Mando para generar informes periciales.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((att) => {
              const isOpen = expandedAttemptId === att._id;
              const dateLabel = new Date(att.createdAt).toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <article
                  key={att._id}
                  className="rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedAttemptId(isOpen ? null : att._id)
                    }
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-left hover:bg-slate-900/40 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        {att.missionId && (
                          <>
                            <span>
                              {CATEGORIA_LABELS[att.missionId.categoria]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {DIFICULTAD_LABELS[att.missionId.dificultad]}
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className="font-mono">{dateLabel}</span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-white">
                        {att.missionId?.titulo || 'Misión archivada'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          att.aprobado ? 'text-[#10b981]' : 'text-amber-400'
                        }`}
                      >
                        {att.aprobado ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        {att.aprobado ? 'Aprobada' : 'Para repaso'}
                      </span>

                      <span className="font-mono text-sm font-bold text-white tabular-nums">
                        {att.puntuacionObtenida}/100
                      </span>

                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-800 bg-[#05080f] p-6 space-y-5 text-sm">
                      {att.respuestaUsuario.justificacion && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-1">
                            Tu justificación escrita
                          </p>
                          <p className="text-slate-200 italic">
                            "{att.respuestaUsuario.justificacion}"
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-[#10b981] mb-1">
                              Explicación técnica de Gemini AI
                            </h4>
                            <p className="text-slate-200 leading-relaxed">
                              {att.feedbackIA.explicacionTecnica}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-sky-300 mb-1">
                              Marco jurídico sencillo
                            </h4>
                            <p className="text-slate-300 leading-relaxed">
                              {att.feedbackIA.marcoJuridicoSencillo}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-amber-300 mb-1">
                              Riesgos identificados
                            </h4>
                            <ul className="space-y-1 text-slate-300">
                              {att.feedbackIA.riesgosCiberseguridad.map(
                                (r, idx) => (
                                  <li key={idx}>· {r}</li>
                                )
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-[#10b981] mb-1">
                              Recomendaciones preventivas
                            </h4>
                            <ul className="space-y-1 text-slate-300">
                              {att.feedbackIA.recomendacionesPreventivas.map(
                                (rec, idx) => (
                                  <li key={idx}>· {rec}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {att.missionId && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onPlayMission(att.missionId!._id)}
                            className="rounded-lg border border-slate-700 bg-[#0a0f1c] px-4 py-2 text-xs font-semibold text-white hover:border-[#10b981] transition-colors cursor-pointer"
                          >
                            Abrir misión y sala de debate
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
