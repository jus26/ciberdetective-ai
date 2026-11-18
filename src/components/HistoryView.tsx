import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CATEGORY_LABELS, type AttemptRecord } from '../types';

interface HistoryViewProps {
  onGoToMissions: () => void;
}

export function HistoryView({ onGoToMissions }: HistoryViewProps) {
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .getHistory()
      .then((res) => {
        if (mounted) {
          setHistory(res.history);
          if (res.history.length > 0) {
            setExpandedId(res.history[0].id);
          }
        }
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Error al cargar el historial.');
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
      <div className="border-b border-slate-800/90 pb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Historial de partidas y dictámenes
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Consulta todos los expedientes que has resuelto junto con la
          explicación técnica y jurídica generada por Gemini.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 rounded-xl border border-slate-800 bg-[#0B1324] animate-pulse"
            />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-12 text-center space-y-4">
          <p className="font-display text-lg font-semibold text-white">
            Todavía no has resuelto ningún caso
          </p>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Completa tu primera misión para registrar tu progreso y conservar
            los informes periciales de Gemini en tu historial.
          </p>
          <button
            type="button"
            onClick={onGoToMissions}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Ir a las misiones
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isExpanded = expandedId === item.id;
            const dateLabel = new Date(item.createdAt).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-800 bg-[#0B1324] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id)
                  }
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-left hover:bg-slate-900/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{CATEGORY_LABELS[item.missionCategory]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{dateLabel}</span>
                    </div>
                    <h2 className="font-display text-base font-semibold text-white">
                      {item.missionTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {item.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Correcto</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400">Incorrecto</span>
                        </>
                      )}
                    </div>

                    <div className="text-xs font-mono tabular-nums text-slate-300">
                      +{item.xpEarned} XP · +{item.pointsEarned} pts
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-6 bg-[#070E1D] space-y-5 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1">
                        Tu respuesta seleccionada
                      </p>
                      <p className="text-slate-200">{item.selectedOptionText}</p>
                    </div>

                    {item.userJustification && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 mb-1">
                          Tu justificación analítica
                        </p>
                        <p className="text-slate-300 italic">
                          "{item.userJustification}"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800/80 pt-5">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xs font-semibold text-emerald-400 mb-1">
                            Evaluación de Gemini
                          </h3>
                          <p className="text-slate-200 leading-relaxed">
                            {item.aiAnalysis.evaluationSummary}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-white mb-1">
                            Motivo de la respuesta correcta
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            {item.aiAnalysis.correctAnswerReason}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-sky-300 mb-1">
                            Explicación jurídica
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            {item.aiAnalysis.legalExplanation}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-semibold text-amber-300 mb-1.5">
                            Riesgos identificados
                          </h3>
                          <ul className="space-y-1 text-slate-300">
                            {item.aiAnalysis.cybersecurityRisks.map((r, i) => (
                              <li key={i}>· {r}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-emerald-400 mb-1.5">
                            Recomendaciones preventivas
                          </h3>
                          <ul className="space-y-1 text-slate-300">
                            {item.aiAnalysis.preventiveRecommendations.map(
                              (rec, i) => (
                                <li key={i}>· {rec}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
