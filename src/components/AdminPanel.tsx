import { AlertCircle, CheckCircle2, Edit3, Plus, Power, Trash2, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../services/api';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type AdminMission,
  type ArtifactType,
  type MissionCategory,
  type MissionDifficulty,
} from '../types';

interface MissionFormState {
  title: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  basePoints: number;
  brief: string;
  artifactType: ArtifactType;
  sender: string;
  subject: string;
  headersText: string;
  body: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionId: 'a' | 'b' | 'c' | 'd';
  referenceSolution: string;
  legalContext: string;
  isActive: boolean;
}

const EMPTY_FORM: MissionFormState = {
  title: '',
  category: 'phishing',
  difficulty: 'intermedio',
  xpReward: 150,
  basePoints: 200,
  brief: '',
  artifactType: 'email',
  sender: '',
  subject: '',
  headersText: '',
  body: '',
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOptionId: 'a',
  referenceSolution: '',
  legalContext: '',
  isActive: true,
};

export function AdminPanel({ onMissionsChanged }: { onMissionsChanged: () => void }) {
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [stats, setStats] = useState({
    usersCount: 0,
    missionsCount: 0,
    attemptsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MissionFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListMissions();
      setMissions(res.missions);
      setStats(res.stats);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar el panel de administración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(null);
    setNotice(null);
  };

  const openEditForm = (m: AdminMission) => {
    const getOpt = (id: string) =>
      m.options.find((o) => o.id === id)?.text || '';
    setEditingId(m.id);
    setForm({
      title: m.title,
      category: m.category,
      difficulty: m.difficulty,
      xpReward: m.xpReward,
      basePoints: m.basePoints,
      brief: m.brief,
      artifactType: m.artifactType,
      sender: m.artifactData.sender || '',
      subject: m.artifactData.subject || '',
      headersText: (m.artifactData.headers || []).join('\n'),
      body: m.artifactData.body,
      question: m.question,
      optionA: getOpt('a'),
      optionB: getOpt('b'),
      optionC: getOpt('c'),
      optionD: getOpt('d'),
      correctOptionId: (m.correctOptionId as 'a' | 'b' | 'c' | 'd') || 'a',
      referenceSolution: m.referenceSolution,
      legalContext: m.legalContext,
      isActive: m.isActive,
    });
    setShowForm(true);
    setError(null);
    setNotice(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      title: form.title.trim(),
      category: form.category,
      difficulty: form.difficulty,
      xpReward: Number(form.xpReward),
      basePoints: Number(form.basePoints),
      brief: form.brief.trim(),
      artifactType: form.artifactType,
      artifactData: {
        sender: form.sender.trim() || undefined,
        subject: form.subject.trim() || undefined,
        headers: form.headersText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
        body: form.body.trim(),
      },
      question: form.question.trim(),
      options: [
        { id: 'a', label: 'A', text: form.optionA.trim() },
        { id: 'b', label: 'B', text: form.optionB.trim() },
        { id: 'c', label: 'C', text: form.optionC.trim() },
        { id: 'd', label: 'D', text: form.optionD.trim() },
      ],
      correctOptionId: form.correctOptionId,
      referenceSolution: form.referenceSolution.trim(),
      legalContext: form.legalContext.trim(),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await api.adminUpdateMission(editingId, payload);
        setNotice('Misión actualizada correctamente.');
      } else {
        await api.adminCreateMission(payload);
        setNotice('Nueva misión creada y publicada.');
      }
      setShowForm(false);
      await loadAdminData();
      onMissionsChanged();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la misión.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.adminToggleMission(id);
      await loadAdminData();
      onMissionsChanged();
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar el estado.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.adminDeleteMission(id);
      setNotice('Misión eliminada del catálogo.');
      await loadAdminData();
      onMissionsChanged();
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la misión.');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/90 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Panel de administración de misiones
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Gestiona casos prácticos, soluciones de referencia y contextos
            jurídicos verificados para Gemini.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva misión</span>
        </button>
      </div>

      {/* Admin Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
          <p className="text-xs text-slate-400">Misiones totales</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-white tabular-nums">
            {missions.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
          <p className="text-xs text-slate-400">Detectives registrados</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-white tabular-nums">
            {stats.usersCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-5">
          <p className="text-xs text-slate-400">Partidas evaluadas</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {stats.attemptsCount}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Create / Edit Modal or Inline Panel */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-emerald-500/40 bg-[#091224] p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-display text-lg font-bold text-white">
              {editingId ? 'Editar misión existente' : 'Crear nueva misión'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Título del caso
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as MissionCategory,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="phishing">Phishing y Estafas</option>
                <option value="privacy">Protección de Datos y Privacidad</option>
                <option value="digital_law">Derecho Digital Español y Europeo</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dificultad
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      difficulty: e.target.value as MissionDifficulty,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-2.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="inicial">Inicial</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  XP
                </label>
                <input
                  type="number"
                  min={20}
                  max={1000}
                  value={form.xpReward}
                  onChange={(e) =>
                    setForm({ ...form, xpReward: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Puntos
                </label>
                <input
                  type="number"
                  min={20}
                  max={1500}
                  value={form.basePoints}
                  onChange={(e) =>
                    setForm({ ...form, basePoints: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contexto / Enunciado del caso
              </label>
              <textarea
                rows={2}
                required
                minLength={20}
                value={form.brief}
                onChange={(e) => setForm({ ...form, brief: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de artefacto
              </label>
              <select
                value={form.artifactType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    artifactType: e.target.value as ArtifactType,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              >
                <option value="email">Correo electrónico</option>
                <option value="privacy_notice">Auditoría de privacidad</option>
                <option value="incident_log">Registro de incidente</option>
                <option value="legal_dossier">Expediente jurídico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Remitente / Origen (opcional)
              </label>
              <input
                type="text"
                value={form.sender}
                onChange={(e) => setForm({ ...form, sender: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cuerpo de evidencia técnica o documental
              </label>
              <textarea
                rows={3}
                required
                minLength={10}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pregunta tipo test
              </label>
              <input
                type="text"
                required
                minLength={10}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Opción A
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.optionA}
                onChange={(e) => setForm({ ...form, optionA: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Opción B
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.optionB}
                onChange={(e) => setForm({ ...form, optionB: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Opción C
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.optionC}
                onChange={(e) => setForm({ ...form, optionC: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Opción D
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.optionD}
                onChange={(e) => setForm({ ...form, optionD: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Respuesta correcta
              </label>
              <select
                value={form.correctOptionId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    correctOptionId: e.target.value as 'a' | 'b' | 'c' | 'd',
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              >
                <option value="a">Opción A</option>
                <option value="b">Opción B</option>
                <option value="c">Opción C</option>
                <option value="d">Opción D</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-5">
              <input
                id="mission-active-toggle"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="accent-emerald-500"
              />
              <label
                htmlFor="mission-active-toggle"
                className="text-xs font-medium text-slate-200"
              >
                Misión visible y activa para los jugadores
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Solución de referencia (guía de evaluación para Gemini)
              </label>
              <textarea
                rows={3}
                required
                minLength={20}
                value={form.referenceSolution}
                onChange={(e) =>
                  setForm({ ...form, referenceSolution: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contexto jurídico verificado (normativa real permitida para evitar alucinaciones)
              </label>
              <textarea
                rows={3}
                required
                minLength={20}
                value={form.legalContext}
                onChange={(e) =>
                  setForm({ ...form, legalContext: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar misión'}
            </button>
          </div>
        </form>
      )}

      {/* Missions Management Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B1324]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#070E1D] text-xs font-medium text-slate-400">
              <th className="py-3.5 px-5">Caso</th>
              <th className="py-3.5 px-5">Categoría</th>
              <th className="py-3.5 px-5">Dificultad</th>
              <th className="py-3.5 px-5 text-right">XP / Pts</th>
              <th className="py-3.5 px-5">Estado</th>
              <th className="py-3.5 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  Cargando catálogo de misiones...
                </td>
              </tr>
            ) : (
              missions.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-5 font-medium text-white max-w-xs truncate">
                    {m.title}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-300">
                    {CATEGORY_LABELS[m.category]}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-300">
                    {DIFFICULTY_LABELS[m.difficulty]}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums text-xs text-slate-300">
                    {m.xpReward} / {m.basePoints}
                  </td>
                  <td className="py-3.5 px-5 text-xs">
                    <span
                      className={
                        m.isActive ? 'text-emerald-400' : 'text-slate-500'
                      }
                    >
                      {m.isActive ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        title="Editar misión"
                        onClick={() => openEditForm(m)}
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title={m.isActive ? 'Pausar misión' : 'Activar misión'}
                        onClick={() => handleToggle(m.id)}
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/60 cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar misión"
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/60 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
