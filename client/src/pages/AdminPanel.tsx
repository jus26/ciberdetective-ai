import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiClient } from '../services/apiClient';
import {
  CATEGORIA_LABELS,
  DIFICULTAD_LABELS,
  type AdminMissionItem,
  type MissionCategoria,
  type MissionDificultad,
} from '../types';

interface AdminFormState {
  titulo: string;
  descripcion: string;
  categoria: MissionCategoria;
  dificultad: MissionDificultad;
  tiempoLimiteSegundos: number;
  xpRecompensa: number;
  emailRemitente: string;
  emailDestinatario: string;
  emailAsunto: string;
  emailCabeceras: string;
  emailCuerpo: string;
  logsTexto: string;
  extractosLegalesTexto: string;
  preguntaPrincipal: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  opcionCorrectaId: 'a' | 'b' | 'c' | 'd';
  solucionReferencia: string;
  marcoLegalReal: string;
  activa: boolean;
}

const INITIAL_FORM: AdminFormState = {
  titulo: '',
  descripcion: '',
  categoria: 'phishing',
  dificultad: 'medio',
  tiempoLimiteSegundos: 300,
  xpRecompensa: 150,
  emailRemitente: '',
  emailDestinatario: '',
  emailAsunto: '',
  emailCabeceras: '',
  emailCuerpo: '',
  logsTexto: '',
  extractosLegalesTexto: '',
  preguntaPrincipal: '',
  opcionA: '',
  opcionB: '',
  opcionC: '',
  opcionD: '',
  opcionCorrectaId: 'a',
  solucionReferencia: '',
  marcoLegalReal: '',
  activa: true,
};

export function AdminPanel() {
  const [missions, setMissions] = useState<AdminMissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminFormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.adminListMissions();
      setMissions(res.misiones);
    } catch (err: any) {
      setError(
        err?.message || 'Error al cargar las misiones de administración.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
    setError(null);
    setNotice(null);
  };

  const openEdit = (m: AdminMissionItem) => {
    const mail = m.evidencias.correosSimulados?.[0];
    const getOpt = (id: string) =>
      m.opcionesTest.find((o) => o.id === id)?.texto || '';
    const correctOpt =
      (m.opcionesTest.find((o) => o.esCorrecta)?.id as
        | 'a'
        | 'b'
        | 'c'
        | 'd') || 'a';

    setEditingId(m.id);
    setForm({
      titulo: m.titulo,
      descripcion: m.descripcion,
      categoria: m.categoria,
      dificultad: m.dificultad,
      tiempoLimiteSegundos: m.tiempoLimiteSegundos,
      xpRecompensa: m.xpRecompensa,
      emailRemitente: mail?.remitente || '',
      emailDestinatario: mail?.destinatario || '',
      emailAsunto: mail?.asunto || '',
      emailCabeceras: (mail?.cabeceras || []).join('\n'),
      emailCuerpo: mail?.cuerpo || '',
      logsTexto: (m.evidencias.logs || []).join('\n'),
      extractosLegalesTexto: (m.evidencias.extractosLegales || []).join('\n'),
      preguntaPrincipal: m.preguntaPrincipal,
      opcionA: getOpt('a'),
      opcionB: getOpt('b'),
      opcionC: getOpt('c'),
      opcionD: getOpt('d'),
      opcionCorrectaId: correctOpt,
      solucionReferencia: m.solucionReferencia,
      marcoLegalReal: m.marcoLegalReal,
      activa: m.activa,
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

    const hasEmail =
      form.emailRemitente.trim() &&
      form.emailAsunto.trim() &&
      form.emailCuerpo.trim();

    const payload: Omit<AdminMissionItem, 'id'> = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      dificultad: form.dificultad,
      tiempoLimiteSegundos: Number(form.tiempoLimiteSegundos),
      xpRecompensa: Number(form.xpRecompensa),
      evidencias: {
        correosSimulados: hasEmail
          ? [
              {
                remitente: form.emailRemitente.trim(),
                destinatario:
                  form.emailDestinatario.trim() || 'agente@empresa.es',
                asunto: form.emailAsunto.trim(),
                cabeceras: form.emailCabeceras
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
                cuerpo: form.emailCuerpo.trim(),
              },
            ]
          : [],
        logs: form.logsTexto
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        metadatos: {
          'Categoría operativa': CATEGORIA_LABELS[form.categoria],
        },
        extractosLegales: form.extractosLegalesTexto
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      preguntaPrincipal: form.preguntaPrincipal.trim(),
      opcionesTest: [
        {
          id: 'a',
          etiqueta: 'A',
          texto: form.opcionA.trim(),
          esCorrecta: form.opcionCorrectaId === 'a',
        },
        {
          id: 'b',
          etiqueta: 'B',
          texto: form.opcionB.trim(),
          esCorrecta: form.opcionCorrectaId === 'b',
        },
        {
          id: 'c',
          etiqueta: 'C',
          texto: form.opcionC.trim(),
          esCorrecta: form.opcionCorrectaId === 'c',
        },
        {
          id: 'd',
          etiqueta: 'D',
          texto: form.opcionD.trim(),
          esCorrecta: form.opcionCorrectaId === 'd',
        },
      ],
      solucionReferencia: form.solucionReferencia.trim(),
      marcoLegalReal: form.marcoLegalReal.trim(),
      activa: form.activa,
    };

    try {
      if (editingId) {
        await apiClient.adminUpdateMission(editingId, payload);
        setNotice('Misión actualizada correctamente en MongoDB.');
      } else {
        await apiClient.adminCreateMission(payload);
        setNotice('Nueva misión creada y publicada.');
      }
      setShowForm(false);
      await loadMissions();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la misión.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setNotice(null);
    try {
      await apiClient.adminDeleteMission(id);
      setNotice('Misión eliminada correctamente.');
      await loadMissions();
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la misión.');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10b981] mb-1">
            <Shield className="w-4 h-4" />
            <span>Consola de Administración SOC</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            Gestión de misiones y evidencias
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Crea, edita o elimina expedientes con sus evidencias técnicas,
            solución de referencia y marco legal verificado.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-xs font-semibold text-[#05080f] hover:bg-[#059669] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear misión</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#10b981]/50 bg-[#10b981]/10 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[#10b981]/40 bg-[#0a0f1c] p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-display text-lg font-bold text-white">
              {editingId ? 'Editar expediente' : 'Nuevo expediente operativo'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Título de la misión
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white focus:border-[#10b981] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoria: e.target.value as MissionCategoria,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              >
                <option value="phishing">Phishing y Estafas</option>
                <option value="privacidad">Privacidad y Datos</option>
                <option value="derecho_digital">Derecho Digital</option>
                <option value="forense">Análisis Forense</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dificultad
                </label>
                <select
                  value={form.dificultad}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dificultad: e.target.value as MissionDificultad,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-2.5 py-2 text-sm text-white"
                >
                  <option value="facil">Inicial</option>
                  <option value="medio">Medio</option>
                  <option value="experto">Experto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tiempo (seg)
                </label>
                <input
                  type="number"
                  min={60}
                  max={3600}
                  value={form.tiempoLimiteSegundos}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tiempoLimiteSegundos: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  XP
                </label>
                <input
                  type="number"
                  min={20}
                  max={2000}
                  value={form.xpRecompensa}
                  onChange={(e) =>
                    setForm({ ...form, xpRecompensa: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Descripción del caso
              </label>
              <textarea
                rows={2}
                required
                minLength={20}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Evidencias Estructuradas */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h3 className="text-xs font-semibold text-[#10b981]">
              Evidencias digitales y documentales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Correo simulado: Remitente (opcional)
                </label>
                <input
                  type="text"
                  value={form.emailRemitente}
                  onChange={(e) =>
                    setForm({ ...form, emailRemitente: e.target.value })
                  }
                  placeholder="Banco <alerta@falso.com>"
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Destinatario (opcional)
                </label>
                <input
                  type="text"
                  value={form.emailDestinatario}
                  onChange={(e) =>
                    setForm({ ...form, emailDestinatario: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Asunto (opcional)
                </label>
                <input
                  type="text"
                  value={form.emailAsunto}
                  onChange={(e) =>
                    setForm({ ...form, emailAsunto: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-300 mb-1">
                  Cabeceras SMTP (una por línea, opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.emailCabeceras}
                  onChange={(e) =>
                    setForm({ ...form, emailCabeceras: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-300 mb-1">
                  Cuerpo del correo simulado (opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.emailCuerpo}
                  onChange={(e) =>
                    setForm({ ...form, emailCuerpo: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-300 mb-1">
                  Logs del servidor (uno por línea, opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.logsTexto}
                  onChange={(e) =>
                    setForm({ ...form, logsTexto: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-300 mb-1">
                  Extractos legales o documentales (uno por línea, opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.extractosLegalesTexto}
                  onChange={(e) =>
                    setForm({ ...form, extractosLegalesTexto: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Cuestionario y Referencia IA */}
          <div className="border-t border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pregunta principal del caso
              </label>
              <input
                type="text"
                required
                minLength={10}
                value={form.preguntaPrincipal}
                onChange={(e) =>
                  setForm({ ...form, preguntaPrincipal: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Opción A
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.opcionA}
                onChange={(e) => setForm({ ...form, opcionA: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Opción B
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.opcionB}
                onChange={(e) => setForm({ ...form, opcionB: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Opción C
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.opcionC}
                onChange={(e) => setForm({ ...form, opcionC: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Opción D
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={form.opcionD}
                onChange={(e) => setForm({ ...form, opcionD: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Opción correcta
              </label>
              <select
                value={form.opcionCorrectaId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    opcionCorrectaId: e.target.value as 'a' | 'b' | 'c' | 'd',
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              >
                <option value="a">Opción A</option>
                <option value="b">Opción B</option>
                <option value="c">Opción C</option>
                <option value="d">Opción D</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-5">
              <input
                id="admin-mission-active"
                type="checkbox"
                checked={form.activa}
                onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                className="accent-[#10b981]"
              />
              <label
                htmlFor="admin-mission-active"
                className="text-xs font-medium text-slate-200"
              >
                Misión activa para jugadores
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">
                Solución de referencia (guía técnica para Gemini AI)
              </label>
              <textarea
                rows={3}
                required
                minLength={20}
                value={form.solucionReferencia}
                onChange={(e) =>
                  setForm({ ...form, solucionReferencia: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">
                Marco legal real verificado (única fuente normativa permitida a
                la IA)
              </label>
              <textarea
                rows={3}
                required
                minLength={20}
                value={form.marcoLegalReal}
                onChange={(e) =>
                  setForm({ ...form, marcoLegalReal: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#10b981] px-5 py-2 text-xs font-semibold text-[#05080f] hover:bg-[#059669] disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar misión'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Misiones */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0a0f1c]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#05080f] text-xs font-medium text-slate-400">
              <th className="py-3.5 px-5">Título</th>
              <th className="py-3.5 px-5">Categoría</th>
              <th className="py-3.5 px-5">Dificultad</th>
              <th className="py-3.5 px-5 text-right">XP</th>
              <th className="py-3.5 px-5">Estado</th>
              <th className="py-3.5 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-xs text-slate-400"
                >
                  Cargando misiones...
                </td>
              </tr>
            ) : (
              missions.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-5 font-medium text-white max-w-xs truncate">
                    {m.titulo}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-300">
                    {CATEGORIA_LABELS[m.categoria]}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-300">
                    {DIFICULTAD_LABELS[m.dificultad]}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums text-xs text-[#10b981]">
                    {m.xpRecompensa}
                  </td>
                  <td className="py-3.5 px-5 text-xs">
                    <span
                      className={m.activa ? 'text-[#10b981]' : 'text-slate-500'}
                    >
                      {m.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        title="Editar misión"
                        onClick={() => openEdit(m)}
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
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
