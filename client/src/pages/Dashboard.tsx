import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Leaf,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import {
  CATEGORIA_LABELS,
  DIFICULTAD_LABELS,
  type MissionCategoria,
  type MissionDificultad,
  type MissionItem,
  type PendingAlert,
} from '../types';

interface DashboardProps {
  onPlayMission: (missionId: string) => void;
}

function isEqualityMission(titulo: string, descripcion: string): boolean {
  return /igualdad|discriminaci[oó]n|sesgos|libertad sexual|preguntas intrusivas|equidad/i.test(
    `${titulo} ${descripcion}`
  );
}

function isSustainabilityMission(titulo: string, descripcion: string): boolean {
  return /dieselgate|greenwashing|emisiones|econom[ií]a circular|obsolescencia|ecodise[nñ]o|empleo verde|sostenible|sostenibilidad|l[ií]mites planetarios|agenda 2030|ods/i.test(
    `${titulo} ${descripcion}`
  );
}

type DashboardCategoryFilter = MissionCategoria | 'todas' | 'sostenibilidad';

export function Dashboard({ onPlayMission }: DashboardProps) {
  const { user, stats, rankInfo } = useAuth();
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [alerts, setAlerts] = useState<PendingAlert[]>([]);
  const [categoriaFilter, setCategoriaFilter] =
    useState<DashboardCategoryFilter>('todas');
  const [dificultadFilter, setDificultadFilter] = useState<
    MissionDificultad | 'todas'
  >('todas');
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    setLoadingMissions(true);
    setError(null);
    try {
      const res = await apiClient.listMissions({
        categoria:
          categoriaFilter === 'sostenibilidad' ? 'todas' : categoriaFilter,
        dificultad: dificultadFilter,
      });
      const filtered =
        categoriaFilter === 'sostenibilidad'
          ? res.misiones.filter((m) =>
              isSustainabilityMission(m.titulo, m.descripcion)
            )
          : res.misiones;
      setMissions(filtered);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las misiones.');
    } finally {
      setLoadingMissions(false);
    }
  }, [categoriaFilter, dificultadFilter]);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await apiClient.getPendingAlerts(true);
      setAlerts(res.alertasPendientes);
    } catch {
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  if (!user) return null;

  const progressPercent = rankInfo.nextXp
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((user.xp - rankInfo.minXp) / (rankInfo.nextXp - rankInfo.minXp)) *
              100
          )
        )
      )
    : 100;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Cabecera del Centro de Mando del Agente */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#10b981] mb-1">
                Centro de Mando · Expediente Activo
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {user.nombre}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Nivel {user.nivel} · {rankInfo.titulo}
              </p>
            </div>

            <div className="text-right font-mono tabular-nums">
              <p className="text-xs text-slate-400">Experiencia acumulada</p>
              <p className="text-2xl font-bold text-[#10b981]">{user.xp} XP</p>
            </div>
          </div>

          {/* Barra animada de XP */}
          <div className="space-y-2">
            <div className="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-[#05080f]">
              <div
                className="h-full bg-gradient-to-r from-[#059669] to-[#10b981] transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
              <span>Progreso de nivel: {progressPercent}%</span>
              <span>
                {rankInfo.nextXp
                  ? `${Math.max(0, rankInfo.nextXp - user.xp)} XP para Nivel ${user.nivel + 1}`
                  : 'Rango máximo alcanzado'}
              </span>
            </div>
          </div>
        </div>

        {/* Indicadores de Racha, Precisión e Insignias */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Racha diaria</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <p className="mt-4 font-mono text-2xl font-bold text-white tabular-nums">
              {user.rachaDias}d
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Conexión activa</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Aciertos</span>
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            </div>
            <p className="mt-4 font-mono text-2xl font-bold text-white tabular-nums">
              {stats ? `${stats.tasaAcierto}%` : '0%'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
              {stats?.misionesAprobadas ?? 0} resueltas
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Insignias</span>
              <Award className="w-4 h-4 text-[#10b981]" />
            </div>
            <p className="mt-4 font-mono text-2xl font-bold text-white tabular-nums">
              {user.insignias?.length ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Desbloqueadas</p>
          </div>
        </div>
      </section>

      {/* Panel de Alertas de Repetición Espaciada */}
      <section className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Alertas de repetición espaciada
              </h2>
              <p className="text-xs text-slate-400">
                Casos fallados programados para refuerzo técnico y jurídico
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAlerts}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>

        {loadingAlerts ? (
          <div className="h-16 rounded-lg bg-[#05080f] animate-pulse" />
        ) : alerts.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">
            No tienes casos pendientes de repetición espaciada. Todos tus
            dictámenes están al día.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              if (!alert.mision) return null;
              const fechaStr = new Date(
                alert.fechaProximaAlerta
              ).toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={alert.attemptId}
                  className="flex items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-[#05080f] p-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={
                          alert.vencida ? 'text-amber-400 font-semibold' : 'text-slate-400'
                        }
                      >
                        {alert.vencida ? 'Revisión lista ahora' : `Programada: ${fechaStr}`}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        Última nota: {alert.ultimaPuntuacion}/100
                      </span>
                    </div>
                    <p className="font-display text-sm font-semibold text-white truncate">
                      {alert.mision.titulo}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlayMission(alert.mision!._id)}
                    className="rounded-lg bg-amber-500/15 border border-amber-500/40 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-[#05080f] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Selector de Misiones Filtrable */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Expedientes disponibles
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Filtra por rama operativa o nivel de complejidad para iniciar una
              investigación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por categoría */}
            <div
              role="tablist"
              aria-label="Categoría de misión"
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg border border-slate-800 bg-[#0a0f1c]"
            >
              {(
                [
                  { id: 'todas', label: 'Todas' },
                  { id: 'phishing', label: 'Phishing' },
                  { id: 'privacidad', label: 'Privacidad' },
                  { id: 'derecho_digital', label: 'Derecho Digital' },
                  { id: 'forense', label: 'Forense' },
                  {
                    id: 'sostenibilidad',
                    label: 'Sostenibilidad & Ecoeficiencia',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={categoriaFilter === tab.id}
                  onClick={() => setCategoriaFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    categoriaFilter === tab.id
                      ? 'bg-[#10b981] text-[#05080f] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filtro por dificultad */}
            <select
              aria-label="Filtrar por dificultad"
              value={dificultadFilter}
              onChange={(e) =>
                setDificultadFilter(
                  e.target.value as MissionDificultad | 'todas'
                )
              }
              className="rounded-lg border border-slate-800 bg-[#0a0f1c] px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-[#10b981] focus:outline-none"
            >
              <option value="todas">Todas las dificultades</option>
              <option value="facil">Inicial</option>
              <option value="medio">Medio</option>
              <option value="experto">Experto</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loadingMissions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 rounded-xl border border-slate-800 bg-[#0a0f1c] animate-pulse"
              />
            ))}
          </div>
        ) : missions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-12 text-center space-y-3">
            <p className="font-display text-base font-semibold text-white">
              No hay misiones para los filtros seleccionados
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoriaFilter('todas');
                setDificultadFilter('todas');
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:border-[#10b981] cursor-pointer"
            >
              Mostrar todas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {missions.map((mission) => (
              <article
                key={mission.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                    <span>{CATEGORIA_LABELS[mission.categoria]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{DIFICULTAD_LABELS[mission.dificultad]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[#10b981] tabular-nums">
                      {mission.xpRecompensa} XP
                    </span>
                  </div>

                  {isEqualityMission(mission.titulo, mission.descripcion) && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/30 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
                      <Scale className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                      <span>Igualdad y No Discriminación</span>
                    </div>
                  )}

                  {isSustainabilityMission(mission.titulo, mission.descripcion) && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md border border-[#10b981]/45 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10b981]">
                      <Leaf className="w-3.5 h-3.5 shrink-0" />
                      <span>Sostenibilidad & Ecoeficiencia</span>
                    </div>
                  )}

                  <h3 className="font-display text-lg font-semibold text-white leading-snug mb-2">
                    {mission.titulo}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {mission.descripcion}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 tabular-nums">
                    {mission.resuelta ? (
                      <span className="inline-flex items-center gap-1.5 text-[#10b981] font-sans font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Completada
                      </span>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round(mission.tiempoLimiteSegundos / 60)} min</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlayMission(mission.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#10b981] px-4 py-2 text-xs font-semibold text-[#05080f] hover:bg-[#059669] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{mission.resuelta ? 'Repasar' : 'Investigar'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
