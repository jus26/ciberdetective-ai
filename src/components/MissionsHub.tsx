import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type MissionCategory,
  type MissionDifficulty,
  type PublicMission,
} from '../types';

interface MissionsHubProps {
  missions: PublicMission[];
  loading: boolean;
  initialCategory?: MissionCategory | 'all';
  onSelectMission: (mission: PublicMission) => void;
}

export function MissionsHub({
  missions,
  loading,
  initialCategory = 'all',
  onSelectMission,
}: MissionsHubProps) {
  const [categoryFilter, setCategoryFilter] = useState<MissionCategory | 'all'>(
    initialCategory
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    MissionDifficulty | 'all'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return missions.filter((m) => {
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (difficultyFilter !== 'all' && m.difficulty !== difficultyFilter)
        return false;
      if (
        q &&
        !m.title.toLowerCase().includes(q) &&
        !m.brief.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [missions, categoryFilter, difficultyFilter, searchQuery]);

  const solvedCount = missions.filter((m) => m.solved).length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/90 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Misiones operativas y casos prácticos
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Selecciona un expediente para inspeccionar la evidencia técnica o
            jurídica, responder al cuestionario y recibir evaluación de Gemini.
          </p>
        </div>
        <div className="text-xs text-slate-300 font-mono tabular-nums">
          Resueltos: {solvedCount} / {missions.length}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Segmented category filter */}
        <div
          role="tablist"
          aria-label="Filtrar por categoría"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0B1324] border border-slate-800"
        >
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 'phishing', label: 'Phishing y Estafas' },
              { id: 'privacy', label: 'Privacidad y Datos' },
              { id: 'digital_law', label: 'Derecho Digital' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={categoryFilter === tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            aria-label="Filtrar por dificultad"
            value={difficultyFilter}
            onChange={(e) =>
              setDifficultyFilter(e.target.value as MissionDifficulty | 'all')
            }
            className="rounded-lg border border-slate-800 bg-[#0B1324] px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Todas las dificultades</option>
            <option value="inicial">Inicial</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar caso o palabra clave..."
              className="w-full sm:w-64 rounded-lg border border-slate-800 bg-[#0B1324] pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-56 rounded-xl border border-slate-800 bg-[#0B1324] animate-pulse"
            />
          ))}
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-12 text-center">
          <p className="font-display text-base font-semibold text-white">
            No se encontraron misiones con esos filtros
          </p>
          <p className="mt-1.5 text-sm text-slate-400">
            Prueba cambiando la categoría o limpiando el campo de búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setDifficultyFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-emerald-500 cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((mission) => (
            <article
              key={mission.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0B1324] p-6 hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Unboxed metadata with middot separators */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                  <span>{CATEGORY_LABELS[mission.category]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{DIFFICULTY_LABELS[mission.difficulty]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-emerald-400">
                    {mission.xpReward} XP
                  </span>
                </div>

                <h2 className="font-display text-lg font-semibold text-white leading-snug mb-2.5">
                  {mission.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {mission.brief}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div className="text-xs font-mono tabular-nums">
                  {mission.solved ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-sans font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Resuelto
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      +{mission.basePoints} pts
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectMission(mission)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{mission.solved ? 'Repasar caso' : 'Investigar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
