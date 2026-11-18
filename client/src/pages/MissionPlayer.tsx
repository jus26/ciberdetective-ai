import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Leaf,
  Mail,
  MessageSquare,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import {
  CATEGORIA_LABELS,
  DIFICULTAD_LABELS,
  type AnswerMissionResponse,
  type BadgeItem,
  type MissionItem,
} from '../types';

import { DebateRoom } from './DebateRoom';

interface MissionPlayerProps {
  missionId: string;
  onBack: () => void;
  onMissionAnswered?: () => void;
}

type EvidenceTab = 'email' | 'logs' | 'legal';

interface ToastNotification {
  id: string;
  title: string;
  subtitle: string;
}

export function MissionPlayer({
  missionId,
  onBack,
  onMissionAnswered,
}: MissionPlayerProps) {
  const { user, applyProgression } = useAuth();
  const [mission, setMission] = useState<MissionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Temporizador en vivo
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Visor de evidencias
  const [activeTab, setActiveTab] = useState<EvidenceTab>('email');
  const [hoveredSenderIdx, setHoveredSenderIdx] = useState<number | null>(null);

  // Formulario de respuesta
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Resultado Gemini AI + Toasts
  const [result, setResult] = useState<AnswerMissionResponse | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError(null);
    setResult(null);
    setSelectedOptionId('');
    setJustificacion('');
    setElapsedSeconds(0);

    apiClient
      .getMissionDetail(missionId)
      .then((res) => {
        if (!mounted) return;
        const m = res.mision;
        setMission(m);
        setSecondsRemaining(m.tiempoLimiteSegundos);

        if (m.evidencias.correosSimulados?.length > 0) {
          setActiveTab('email');
        } else if (m.evidencias.logs?.length > 0) {
          setActiveTab('logs');
        } else {
          setActiveTab('legal');
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setLoadError(err?.message || 'No se pudo cargar la misión.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [missionId]);

  // Cuenta atrás en vivo mientras no se haya enviado la respuesta
  useEffect(() => {
    if (!mission || result) return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [mission, result]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const triggerToasts = (
    previousLevel: number,
    newLevel: number,
    badges: BadgeItem[]
  ) => {
    const queue: ToastNotification[] = [];
    if (newLevel > previousLevel) {
      queue.push({
        id: `level-${Date.now()}`,
        title: `Ascenso a Nivel ${newLevel}`,
        subtitle: 'Has superado el umbral de experiencia requerido.',
      });
    }
    badges.forEach((b, i) => {
      queue.push({
        id: `badge-${b.codigo}-${i}`,
        title: `Insignia desbloqueada: ${b.nombre}`,
        subtitle: b.descripcion,
      });
    });

    if (queue.length > 0) {
      setToasts(queue);
      window.setTimeout(() => {
        setToasts([]);
      }, 6500);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!mission || !selectedOptionId) return;

    const prevLevel = user?.nivel || 1;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiClient.answerMission(mission.id, {
        opcionId: selectedOptionId,
        justificacion: justificacion.trim(),
        tiempoEmpleadoSegundos: elapsedSeconds,
      });

      setResult(response);
      applyProgression({
        xpTotal: response.xpTotal,
        nivelActual: response.nivelActual,
        nuevasInsignias: response.nuevasInsignias,
      });
      triggerToasts(
        prevLevel,
        response.nivelActual,
        response.nuevasInsignias || []
      );
      onMissionAnswered?.();
    } catch (err: any) {
      setSubmitError(
        err?.message || 'No se pudo evaluar el expediente con Gemini AI.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10 space-y-6">
        <div className="h-8 w-48 rounded bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 rounded-xl border border-slate-800 bg-[#0a0f1c] animate-pulse" />
          <div className="lg:col-span-5 h-96 rounded-xl border border-slate-800 bg-[#0a0f1c] animate-pulse" />
        </div>
      </section>
    );
  }

  if (loadError || !mission) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12 space-y-4">
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-sm text-red-200">
          {loadError || 'Misión no disponible.'}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:border-[#10b981] cursor-pointer"
        >
          Volver al Centro de Mando
        </button>
      </section>
    );
  }

  const speedBonusEligible =
    secondsRemaining > Math.floor(mission.tiempoLimiteSegundos * 0.5);
  const lowTimeWarning = secondsRemaining > 0 && secondsRemaining <= 60;

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      {/* Notificaciones Toast flotantes para nuevas insignias o subida de nivel */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="animate-[fadeSlideUp_0.35s_ease-out_forwards] rounded-xl border border-[#10b981]/60 bg-[#0a0f1c] p-4 shadow-2xl flex items-start gap-3"
            >
              <Award className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm font-bold text-white">
                  {toast.title}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">{toast.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barra superior del caso con temporizador en vivo */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Centro de Mando</span>
        </button>

        <div className="flex flex-wrap items-center gap-5">
          {/igualdad|discriminaci[oó]n|sesgos|libertad sexual|preguntas intrusivas|equidad/i.test(
            `${mission.titulo} ${mission.descripcion}`
          ) && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/30 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
              <Scale className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
              <span>Igualdad y No Discriminación</span>
            </span>
          )}

          {/dieselgate|greenwashing|emisiones|econom[ií]a circular|obsolescencia|ecodise[nñ]o|empleo verde|sostenible|sostenibilidad|l[ií]mites planetarios|agenda 2030|ods/i.test(
            `${mission.titulo} ${mission.descripcion}`
          ) && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#10b981]/45 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10b981]">
              <Leaf className="w-3.5 h-3.5 shrink-0" />
              <span>Sostenibilidad & Ecoeficiencia</span>
            </span>
          )}

          <div className="text-xs text-slate-400">
            <span>{CATEGORIA_LABELS[mission.categoria]}</span>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span>{DIFICULTAD_LABELS[mission.dificultad]}</span>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span className="font-mono text-[#10b981] tabular-nums">
              +{mission.xpRecompensa} XP
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-sm font-semibold tabular-nums ${
              lowTimeWarning
                ? 'border-red-500/60 bg-red-950/30 text-red-300'
                : speedBonusEligible && !result
                ? 'border-[#10b981]/50 bg-[#10b981]/10 text-[#10b981]'
                : 'border-slate-700 bg-[#0a0f1c] text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
            {speedBonusEligible && !result && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-[#10b981] ml-1">
                <Zap className="w-3 h-3" />
                Bonus rapidez
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Enunciado */}
      <div className="space-y-2.5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          {mission.titulo}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          {mission.descripcion}
        </p>
      </div>

      {/* Zona Principal Dual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Visor Interactivo de Evidencias + Formulario */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visor de Evidencias con pestañas */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#05080f] px-4 py-3">
              <div
                role="tablist"
                aria-label="Pestañas de evidencias"
                className="flex flex-wrap items-center gap-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'email'}
                  onClick={() => setActiveTab('email')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'email'
                      ? 'bg-[#10b981] text-[#05080f] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Correo simulado</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'logs'}
                  onClick={() => setActiveTab('logs')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'logs'
                      ? 'bg-[#10b981] text-[#05080f] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Logs del servidor</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'legal'}
                  onClick={() => setActiveTab('legal')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'legal'
                      ? 'bg-[#10b981] text-[#05080f] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Documento legal y metadatos</span>
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* Pestaña 1: Correo simulado con inspección de remitente al pasar el ratón */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  {mission.evidencias.correosSimulados?.length > 0 ? (
                    mission.evidencias.correosSimulados.map((mail, idx) => {
                      const displayOnly = mail.remitente.split('<')[0].trim();
                      const realEmailMatch = mail.remitente.match(/<([^>]+)>/);
                      const realAddress = realEmailMatch
                        ? realEmailMatch[1]
                        : mail.remitente;
                      const returnPathHeader = mail.cabeceras.find((h) =>
                        h.toLowerCase().includes('return-path')
                      );

                      return (
                        <div key={idx} className="space-y-4">
                          <div className="rounded-lg border border-slate-800 bg-[#05080f] p-4 space-y-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-slate-400">Remitente:</span>
                              <button
                                type="button"
                                onMouseEnter={() => setHoveredSenderIdx(idx)}
                                onMouseLeave={() => setHoveredSenderIdx(null)}
                                onFocus={() => setHoveredSenderIdx(idx)}
                                onBlur={() => setHoveredSenderIdx(null)}
                                className="inline-flex items-center gap-1.5 rounded px-2 py-1 bg-[#0a0f1c] border border-slate-700 text-white hover:border-amber-400 transition-colors cursor-help text-left"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="font-medium">
                                  {displayOnly || mail.remitente}
                                </span>
                              </button>
                              <span className="text-[11px] text-slate-400">
                                (Pasa el ratón para inspeccionar origen real)
                              </span>
                            </div>

                            {hoveredSenderIdx === idx && (
                              <div className="rounded border border-amber-500/40 bg-amber-950/25 p-2.5 font-mono text-[11px] text-amber-200 space-y-1">
                                <div>Dirección real: {realAddress}</div>
                                {returnPathHeader && (
                                  <div>{returnPathHeader}</div>
                                )}
                              </div>
                            )}

                            <div className="font-mono text-slate-300">
                              <span className="text-slate-500">Para: </span>
                              {mail.destinatario}
                            </div>
                            <div className="text-sm font-semibold text-white pt-1">
                              {mail.asunto}
                            </div>
                          </div>

                          {mail.cabeceras.length > 0 && (
                            <div className="rounded-lg border border-slate-800 bg-[#05080f] p-3.5 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                              <p className="text-[11px] text-slate-500 mb-1.5">
                                Cabeceras técnicas SMTP / Autenticación:
                              </p>
                              {mail.cabeceras.map((h, i) => (
                                <div
                                  key={i}
                                  className={
                                    h.toLowerCase().includes('fail')
                                      ? 'text-red-300'
                                      : 'text-slate-300'
                                  }
                                >
                                  {h}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="rounded-lg border border-slate-800/80 bg-[#070b14] p-4 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                            {mail.cuerpo}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-400 py-4">
                      Este expediente no incluye correos electrónicos adjuntos.
                      Revisa las pestañas de Logs o Documento legal.
                    </p>
                  )}
                </div>
              )}

              {/* Pestaña 2: Logs del servidor */}
              {activeTab === 'logs' && (
                <div className="rounded-lg border border-slate-800 bg-[#05080f] p-4 font-mono text-xs space-y-2 overflow-x-auto">
                  {mission.evidencias.logs?.length > 0 ? (
                    mission.evidencias.logs.map((line, i) => {
                      const isCritical =
                        /FAIL|EXFILTRATION|VSSADMIN|ENCRYPT|POWERSHELL|ALERT/i.test(
                          line
                        );
                      return (
                        <div
                          key={i}
                          className={`leading-relaxed ${
                            isCritical ? 'text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })
                  ) : (
                    <p className="font-sans text-sm text-slate-400">
                      No se han adjuntado registros técnicos de servidor en este
                      caso.
                    </p>
                  )}
                </div>
              )}

              {/* Pestaña 3: Documento legal y metadatos */}
              {activeTab === 'legal' && (
                <div className="space-y-5">
                  {mission.evidencias.extractosLegales?.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold text-[#10b981]">
                        Extractos normativos y antecedentes documentales
                      </p>
                      <div className="space-y-2">
                        {mission.evidencias.extractosLegales.map((ext, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-slate-800 bg-[#05080f] p-3.5 text-sm text-slate-200 leading-relaxed"
                          >
                            {ext}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mission.evidencias.metadatos &&
                    Object.keys(mission.evidencias.metadatos).length > 0 && (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {Object.entries(mission.evidencias.metadatos).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="border-t border-slate-800 pt-3 text-xs"
                            >
                              <dt className="text-slate-400">{key}</dt>
                              <dd className="text-white font-medium mt-1 leading-relaxed">
                                {value}
                              </dd>
                            </div>
                          )
                        )}
                      </dl>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Respuesta del Agente */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 space-y-5"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-1">
                Resolución del caso
              </h2>
              <p className="text-sm text-slate-300">
                {mission.preguntaPrincipal}
              </p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
              {mission.opcionesTest.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isRightOption =
                  result && result.opcionCorrectaId === opt.id;
                const isWrongSelected =
                  result && isSelected && !result.intento.aprobado;

                let cardStyle =
                  'border-slate-800 bg-[#05080f] hover:border-slate-600';
                if (result) {
                  if (isRightOption) {
                    cardStyle = 'border-[#10b981] bg-[#10b981]/10';
                  } else if (isWrongSelected) {
                    cardStyle = 'border-red-500/70 bg-red-950/25';
                  } else {
                    cardStyle = 'border-slate-800/60 bg-[#05080f]/60 opacity-70';
                  }
                } else if (isSelected) {
                  cardStyle = 'border-[#10b981] bg-[#10b981]/10';
                }

                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3.5 rounded-lg border p-4 transition-colors ${
                      result ? 'cursor-default' : 'cursor-pointer'
                    } ${cardStyle}`}
                  >
                    <input
                      type="radio"
                      name="opcionRespuesta"
                      value={opt.id}
                      checked={isSelected}
                      disabled={Boolean(result) || submitting}
                      onChange={() => setSelectedOptionId(opt.id)}
                      className="mt-1 accent-[#10b981]"
                    />
                    <div className="flex-1 text-sm leading-relaxed">
                      <span className="font-mono font-semibold text-[#10b981] mr-2">
                        [{opt.etiqueta}]
                      </span>
                      <span className="text-white">{opt.texto}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {!result && (
              <div>
                <label
                  htmlFor="justificacion-agente"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Justificación escrita del agente (evaluada por Gemini AI para
                  calificar de 0 a 100)
                </label>
                <textarea
                  id="justificacion-agente"
                  rows={3}
                  maxLength={1500}
                  value={justificacion}
                  disabled={submitting}
                  onChange={(e) => setJustificacion(e.target.value)}
                  placeholder="Resume los indicios técnicos detectados y las obligaciones jurídicas aplicables..."
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] p-3.5 text-sm text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
                />
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {!result && (
              <button
                type="submit"
                disabled={submitting || !selectedOptionId}
                className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-5 py-2.5 text-sm font-semibold text-[#05080f] hover:bg-[#059669] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Generando informe forense con Gemini AI...'
                    : 'Enviar dictamen para evaluación'}
                </span>
              </button>
            )}
          </form>
        </div>

        {/* Columna Derecha: Guía previa o Informe Forense Animado de Gemini AI */}
        <aside className="lg:col-span-5 space-y-5">
          {!result ? (
            <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">
                Instrucciones de evaluación
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Examina las 3 pestañas del visor de evidencias antes de responder.
                Pasa el ratón sobre el remitente de los correos para verificar si
                su dirección visible coincide con el dominio real.
              </p>
              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs text-slate-400">
                <p className="font-semibold text-white">
                  El informe forense de Gemini incluirá:
                </p>
                <p>1. Veredicto y puntuación sobre 100</p>
                <p>2. Explicación técnica del incidente</p>
                <p>3. Riesgos de ciberseguridad detectados</p>
                <p>4. Marco jurídico sencillo español y europeo</p>
                <p>5. Recomendaciones preventivas y pregunta de debate</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-[fadeSlideUp_0.35s_ease-out_forwards]">
              {/* Sección 1: Veredicto y Puntuación */}
              <div
                className={`rounded-xl border p-6 ${
                  result.intento.aprobado
                    ? 'border-[#10b981]/60 bg-[#10b981]/10'
                    : 'border-amber-500/60 bg-amber-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {result.intento.aprobado ? (
                      <CheckCircle2 className="w-6 h-6 text-[#10b981] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <h2 className="font-display text-lg font-bold text-white">
                        {result.intento.aprobado
                          ? 'Caso resuelto con éxito'
                          : 'Requiere revisión (alerta programada)'}
                      </h2>
                      <p className="text-xs font-mono text-slate-200 tabular-nums mt-0.5">
                        +{result.xpGanada} XP · Nivel {result.nivelActual}
                        {speedBonusEligible ? ' · Respuesta rápida' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <span className="text-2xl font-bold text-white">
                      {result.intento.feedbackIA.puntuacion}
                    </span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </div>
              </div>

              {/* Secciones 2 a 5 de Gemini AI */}
              <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-display text-base font-bold text-white">
                    Informe Forense de Gemini AI
                  </h3>
                </div>

                {/* 2. Explicación Técnica */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-[#10b981]">
                    Explicación técnica
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {result.intento.feedbackIA.explicacionTecnica}
                  </p>
                </div>

                {/* 3. Riesgos */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Riesgos de ciberseguridad
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {result.intento.feedbackIA.riesgosCiberseguridad.map(
                      (r, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400">·</span>
                          <span>{r}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* 4. Marco Jurídico Sencillo */}
                <div className="border-t border-slate-800 pt-4 space-y-1.5">
                  <h4 className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    Marco jurídico sencillo
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.intento.feedbackIA.marcoJuridicoSencillo}
                  </p>
                </div>

                {/* 5. Recomendaciones Preventivas */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-[#10b981] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Recomendaciones preventivas
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {result.intento.feedbackIA.recomendacionesPreventivas.map(
                      (rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#10b981]">·</span>
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Pregunta de debate generada por Gemini */}
                <div className="border-t border-slate-800 pt-4 space-y-1.5">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#10b981]" />
                    Pregunta para el foro de debate
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#05080f] rounded-lg border border-slate-800 p-3">
                    {result.intento.feedbackIA.preguntaDebate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Sala de Debate Técnico-Jurídico integrada en la misión */}
      <DebateRoom
        missionId={mission.id}
        preguntaDebate={result?.intento.feedbackIA.preguntaDebate}
      />
    </section>
  );
}
