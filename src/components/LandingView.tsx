import { ArrowRight, BookOpen, Lock, MailWarning, Scale, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { MissionCategory } from '../types';

interface LandingViewProps {
  stats: { usersCount: number; missionsCount: number; attemptsCount: number };
  onStartMissions: (category?: MissionCategory) => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
}

const TRACKS: {
  id: MissionCategory;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: typeof MailWarning;
}[] = [
  {
    id: 'phishing',
    index: '01.',
    title: 'Phishing y Estafas Digitales',
    subtitle: 'BEC · Smishing · Spear-Phishing',
    description:
      'Inspecciona cabeceras SPF/DKIM/DMARC, detecta dominios suplantados, analiza adjuntos con macros y frena fraudes financieros antes de que se ejecuten.',
    image: '/src/assets/images/case_phishing_brief_1794997270808.jpg',
    icon: MailWarning,
  },
  {
    id: 'privacy',
    index: '02.',
    title: 'Protección de Datos y Privacidad',
    subtitle: 'Brechas · Cookies · Videovigilancia',
    description:
      'Evalúa incidentes de exposición de datos personales, plazos de notificación ante la AEPD, diseño ético de consentimiento y control laboral proporcionado.',
    image: '/src/assets/images/case_privacy_audit_1794997270103.jpg',
    icon: Lock,
  },
  {
    id: 'digital_law',
    index: '03.',
    title: 'Derecho Digital Español y Europeo',
    subtitle: 'RGPD · LOPDGDD · LSSI-CE · NIS2',
    description:
      'Resuelve conflictos jurídicos sobre derecho al olvido, acceso ilícito a sistemas corporativos y obligaciones de entidades esenciales en la Unión Europea.',
    image: '/src/assets/images/case_digital_law_1794997270485.jpg',
    icon: Scale,
  },
];

export function LandingView({
  stats,
  onStartMissions,
  onOpenAuth,
  isAuthenticated,
}: LandingViewProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const markFailed = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Split */}
      <section className="mx-auto max-w-7xl px-6 pt-10 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs font-medium tracking-wide text-emerald-400">
              Centro de Entrenamiento en Ciberseguridad y Derecho Digital
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Resuelve incidentes reales con rigor técnico y criterio jurídico
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              CiberDetective AI combina simulación de sala de operaciones de seguridad
              con análisis inteligente asistido por Gemini. Investiga evidencias,
              toma decisiones bajo presión y obtén evaluación forense y legal
              adaptada al marco español y europeo.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onStartMissions()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Explorar misiones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0B1324] px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Crear perfil de detective
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0B1324]">
              {!failedImages['hero'] ? (
                <img
                  src="/src/assets/images/hero_soc_center_1794997269407.jpg"
                  alt="Centro de Operaciones de Ciberseguridad de CiberDetective AI"
                  referrerPolicy="no-referrer"
                  onError={() => markFailed('hero')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0B1324] via-[#071020] to-[#041417] p-8 text-center">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3" />
                  <p className="font-display text-lg font-semibold text-white">
                    Simulador Operativo de Ciberseguridad
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050A14]/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs text-slate-200">
                <span>Simulación de casos · Phishing, Privacidad y RGPD</span>
                <span className="font-mono text-emerald-400">ES / UE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column quantitative strip below hero split */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 border-y border-slate-800/90 py-6">
          <div className="px-2">
            <p className="text-xs text-slate-400 mb-1">Casos activos</p>
            <p className="font-mono text-2xl font-semibold text-white tabular-nums">
              {stats.missionsCount}
            </p>
          </div>
          <div className="px-2">
            <p className="text-xs text-slate-400 mb-1">Detectives registrados</p>
            <p className="font-mono text-2xl font-semibold text-white tabular-nums">
              {stats.usersCount}
            </p>
          </div>
          <div className="px-2">
            <p className="text-xs text-slate-400 mb-1">Evaluaciones emitidas</p>
            <p className="font-mono text-2xl font-semibold text-white tabular-nums">
              {stats.attemptsCount}
            </p>
          </div>
          <div className="px-2">
            <p className="text-xs text-slate-400 mb-1">Marco normativo</p>
            <p className="font-mono text-2xl font-semibold text-emerald-400">
              RGPD · LOPDGDD
            </p>
          </div>
        </div>
      </section>

      {/* 3 Specialized Educational Tracks */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Áreas de investigación y cumplimiento
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Cada expediente combina artefactos técnicos realistas con normativa
              vigente para entrenar tu criterio frente a amenazas digitales.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartMissions()}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Ver todos los casos →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRACKS.map((track) => {
            const Icon = track.icon;
            return (
              <article
                key={track.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0B1324] hover:border-slate-700 transition-colors"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#060C18]">
                  {!failedImages[track.id] ? (
                    <img
                      src={track.image}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      onError={() => markFailed(track.id)}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0B1324] to-[#06181A]">
                      <Icon className="w-10 h-10 text-emerald-400" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1324] via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      {track.subtitle}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-white mb-2.5">
                      {track.index} {track.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onStartMissions(track.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <span>Abrir casos de esta rama</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How Gemini AI Evaluation Works */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-xl border border-slate-800 bg-[#0B1324] p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>Evaluación pericial asistida por IA</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Retroalimentación fundamentada, sin alucinaciones jurídicas
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Cada misión se evalúa en el servidor comparando tu decisión y
                argumentación con la solución técnica de referencia y un contexto
                normativo verificado.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-t border-slate-800 pt-4">
                <h3 className="font-display text-sm font-semibold text-white mb-1.5">
                  01. Validación de la decisión
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contrasta la opción elegida y tu justificación escrita frente al
                  procedimiento de respuesta a incidentes.
                </p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="font-display text-sm font-semibold text-white mb-1.5">
                  02. Riesgos técnicos detectados
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enumera vectores de compromiso, impacto en confidencialidad o
                  fallos de control de acceso presentes en la evidencia.
                </p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="font-display text-sm font-semibold text-white mb-1.5">
                  03. Explicación jurídica sencilla
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Resume obligaciones en España y la UE (RGPD, LOPDGDD, LSSI-CE,
                  NIS2) sin inventar artículos ni sentencias.
                </p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="font-display text-sm font-semibold text-white mb-1.5">
                  04. Medidas preventivas
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Propone salvaguardas prácticas de ingeniería y gobernanza para
                  evitar la recurrencia del incidente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
