import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  FileText,
  Mail,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type PublicMission,
  type SubmitMissionResponse,
} from '../types';

interface MissionWorkspaceProps {
  mission: PublicMission;
  onBack: () => void;
  onOpenAuth: () => void;
  onMissionSolved: () => void;
}

export function MissionWorkspace({
  mission,
  onBack,
  onOpenAuth,
  onMissionSolved,
}: MissionWorkspaceProps) {
  const { user, setUser } = useAuth();
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitMissionResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!selectedOptionId) {
      setError('Selecciona una respuesta antes de enviar el expediente.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = await api.submitMission(mission.id, {
        selectedOptionId,
        userJustification: justification.trim(),
      });
      setResult(response);
      if (response.user) {
        setUser(response.user);
      }
      onMissionSolved();
    } catch (err: any) {
      setError(
        err?.message || 'Ocurrió un error al evaluar la misión con Gemini.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAttempt = () => {
    setSelectedOptionId('');
    setJustification('');
    setResult(null);
    setError(null);
  };

  const ArtifactIcon =
    mission.artifactType === 'email'
      ? Mail
      : mission.artifactType === 'legal_dossier'
      ? Scale
      : FileText;

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      {/* Top breadcrumb & return control */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de misiones</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{CATEGORY_LABELS[mission.category]}</span>
          <span aria-hidden="true">·</span>
          <span>Dificultad {DIFFICULTY_LABELS[mission.difficulty]}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-emerald-400">
            {mission.xpReward} XP / {mission.basePoints} pts
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          {mission.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          {mission.brief}
        </p>
      </div>

      {/* Two-zone layout: Left Interactive Evidence + Test, Right AI Forensic & Legal Debrief */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone (7 cols): Evidence Viewer & Multiple Choice */}
        <div className="lg:col-span-7 space-y-6">
          {/* Evidence Artifact Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#0B1324] overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-[#070E1D] px-5 py-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <ArtifactIcon className="w-4 h-4 text-emerald-400" />
                <span>Evidencia digital del caso</span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {mission.artifactType === 'email'
                  ? 'Correo interceptado'
                  : mission.artifactType === 'privacy_notice'
                  ? 'Auditoría de privacidad'
                  : mission.artifactType === 'incident_log'
                  ? 'Registro de incidente'
                  : 'Expediente jurídico'}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {(mission.artifactData.sender ||
                mission.artifactData.recipient ||
                mission.artifactData.subject) && (
                <div className="space-y-1.5 border-b border-slate-800/80 pb-4 font-mono text-xs">
                  {mission.artifactData.sender && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-slate-500">De:</span>
                      <span className="text-slate-200 break-all">
                        {mission.artifactData.sender}
                      </span>
                    </div>
                  )}
                  {mission.artifactData.recipient && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-slate-500">Para:</span>
                      <span className="text-slate-200 break-all">
                        {mission.artifactData.recipient}
                      </span>
                    </div>
                  )}
                  {mission.artifactData.subject && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-slate-500">Asunto:</span>
                      <span className="text-white font-semibold">
                        {mission.artifactData.subject}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {mission.artifactData.headers &&
                mission.artifactData.headers.length > 0 && (
                  <div className="rounded-lg bg-[#050A14] border border-slate-800/90 p-3.5 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                    {mission.artifactData.headers.map((header, i) => (
                      <div key={i} className="whitespace-pre-wrap break-all">
                        {header}
                      </div>
                    ))}
                  </div>
                )}

              <div className="whitespace-pre-line text-sm text-slate-200 leading-relaxed bg-[#070D1B] rounded-lg border border-slate-800/70 p-4">
                {mission.artifactData.body}
              </div>

              {mission.artifactData.metadata &&
                Object.keys(mission.artifactData.metadata).length > 0 && (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {Object.entries(mission.artifactData.metadata).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="border-t border-slate-800 pt-2.5"
                        >
                          <dt className="text-slate-400">{key}</dt>
                          <dd className="text-slate-100 font-medium mt-0.5">
                            {val}
                          </dd>
                        </div>
                      )
                    )}
                  </dl>
                )}
            </div>
          </div>

          {/* Interactive Test Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-800 bg-[#0B1324] p-6 space-y-5"
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-white mb-1">
                Dictamen operativo y jurídico
              </h2>
              <p className="text-sm text-slate-300">{mission.question}</p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
              {mission.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrectHighlight =
                  result && result.correctOptionId === opt.id;
                const isWrongSelected =
                  result && isSelected && !result.isCorrect;

                let borderStyle = 'border-slate-800 bg-[#070E1D] hover:border-slate-600';
                if (result) {
                  if (isCorrectHighlight) {
                    borderStyle = 'border-emerald-500/80 bg-emerald-950/25';
                  } else if (isWrongSelected) {
                    borderStyle = 'border-red-500/70 bg-red-950/25';
                  } else {
                    borderStyle = 'border-slate-800/70 bg-[#070E1D]/60 opacity-75';
                  }
                } else if (isSelected) {
                  borderStyle = 'border-emerald-500 bg-emerald-950/20';
                }

                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3.5 rounded-lg border p-4 transition-colors ${
                      result ? 'cursor-default' : 'cursor-pointer'
                    } ${borderStyle}`}
                  >
                    <input
                      type="radio"
                      name="missionOption"
                      value={opt.id}
                      checked={isSelected}
                      disabled={Boolean(result) || submitting}
                      onChange={() => setSelectedOptionId(opt.id)}
                      className="mt-1 accent-emerald-500"
                    />
                    <div className="flex-1 text-sm leading-relaxed">
                      <span className="font-mono font-semibold text-emerald-400 mr-2">
                        [{opt.label}]
                      </span>
                      <span className="text-slate-100">{opt.text}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {!result && (
              <div>
                <label
                  htmlFor="mission-justification"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Justificación analítica opcional (+25 XP / +30 pts si aciertas con argumento detallado)
                </label>
                <textarea
                  id="mission-justification"
                  rows={3}
                  maxLength={800}
                  value={justification}
                  disabled={submitting}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explica brevemente qué indicadores técnicos o principios jurídicos respaldan tu elección..."
                  className="w-full rounded-lg border border-slate-700 bg-[#050A14] p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!user && (
              <div className="rounded-lg border border-slate-700 bg-[#070E1D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-300">
                  Inicia sesión para registrar tu puntuación, ganar experiencia y
                  recibir el análisis de Gemini.
                </p>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              {!result ? (
                <button
                  type="submit"
                  disabled={submitting || !selectedOptionId}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Analizando expediente con Gemini...'
                      : 'Enviar dictamen y evaluar'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetAttempt}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  Reintentar misión
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Zone (5 cols): Pre-submission guidance OR Full Gemini AI Debrief */}
        <aside className="lg:col-span-5 space-y-6">
          {!result ? (
            <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold text-white">
                Protocolo de análisis del caso
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Antes de emitir tu respuesta, revisa la evidencia digital buscando
                inconsistencias técnicas y evalúa qué normativa española y europea
                resulta aplicable.
              </p>

              <div className="space-y-4 border-t border-slate-800 pt-4 text-xs text-slate-300">
                <div>
                  <p className="font-semibold text-white mb-1">
                    Al enviar tu respuesta recibirás:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li>1. Evaluación comparada con la solución de referencia.</li>
                    <li>2. Explicación técnica del motivo correcto.</li>
                    <li>3. Identificación de riesgos de ciberseguridad.</li>
                    <li>4. Explicación jurídica sencilla y verificada.</li>
                    <li>5. Recomendaciones preventivas aplicables.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Verdict & Rewards */}
              <div
                className={`rounded-xl border p-6 ${
                  result.isCorrect
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-amber-500/50 bg-amber-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <h2 className="font-display text-lg font-bold text-white">
                        {result.isCorrect
                          ? 'Dictamen correcto'
                          : 'Dictamen incorrecto'}
                      </h2>
                      <p className="text-xs text-slate-300 font-mono tabular-nums mt-0.5">
                        +{result.rewards.xpEarned} XP · +{result.rewards.pointsEarned} pts
                        {result.rewards.alreadySolvedBefore
                          ? ' · Modo repaso'
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {result.rewards.newlyUnlocked.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2">
                    <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Logros desbloqueados:
                    </p>
                    {result.rewards.newlyUnlocked.map((ach) => (
                      <div
                        key={ach.code}
                        className="text-xs text-slate-100 bg-[#050A14]/70 rounded-lg px-3 py-2 border border-emerald-500/30"
                      >
                        <span className="font-semibold">{ach.title}</span>
                        <span className="text-emerald-400 font-mono ml-2">
                          +{ach.xpBonus} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gemini AI Analysis Card */}
              <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-6 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-display text-base font-bold text-white">
                    Informe inteligente de Gemini
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contrastado con la solución de referencia y el marco legal
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-emerald-400">
                    Evaluación de tu respuesta
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {result.attempt.aiAnalysis.evaluationSummary}
                  </p>
                  {result.attempt.aiAnalysis.justificationFeedback && (
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      {result.attempt.aiAnalysis.justificationFeedback}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-1.5">
                  <h4 className="text-xs font-semibold text-white">
                    Motivo de la solución correcta
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.attempt.aiAnalysis.correctAnswerReason}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Riesgos de ciberseguridad identificados
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {result.attempt.aiAnalysis.cybersecurityRisks.map(
                      (risk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">·</span>
                          <span>{risk}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-1.5">
                  <h4 className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    Explicación jurídica sencilla
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.attempt.aiAnalysis.legalExplanation}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Recomendaciones preventivas
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {result.attempt.aiAnalysis.preventiveRecommendations.map(
                      (rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">·</span>
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {result.suspiciousIndicators.length > 0 && (
                  <div className="border-t border-slate-800/80 pt-4 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300">
                      Indicadores forenses de referencia
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-400 font-mono">
                      {result.suspiciousIndicators.map((ind, idx) => (
                        <li key={idx}>- {ind}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
