import {
  ArrowRight,
  FileSearch,
  Lock,
  MailWarning,
  Radar,
  Scale,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface LandingPageProps {
  isAuthenticated: boolean;
  onEnterAuth: () => void;
  onEnterDashboard: () => void;
}

const TERMINAL_LINES = [
  'Iniciando inspección de cabeceras SPF / DKIM / DMARC...',
  'Verificando registro de brechas RGPD (ventana 72h AEPD)...',
  'Analizando exportación de logs RDP sin MFA en servidor ERP...',
  'Contrastando marco legal español y europeo sin alucinaciones...',
];

const DISCIPLINES = [
  {
    index: '01.',
    title: 'Phishing y Estafas Digitales',
    subtitle: 'SPF · DMARC · Typosquatting',
    description:
      'Inspecciona cabeceras de correo, descubre remitentes reales ocultos y frena fraudes financieros antes del impacto.',
    icon: MailWarning,
  },
  {
    index: '02.',
    title: 'Protección de Datos y Privacidad',
    subtitle: 'RGPD · LOPDGDD · Cookies',
    description:
      'Evalúa brechas personales, plazos legales ante la AEPD y patrones oscuros en banners de consentimiento.',
    icon: Lock,
  },
  {
    index: '03.',
    title: 'Derecho Digital Español y Europeo',
    subtitle: 'Código Penal · Derecho al Olvido',
    description:
      'Resuelve casos de suplantación de identidad, desindexación y responsabilidad en servicios digitales.',
    icon: Scale,
  },
  {
    index: '04.',
    title: 'Análisis Forense SOC',
    subtitle: 'Logs · Ransomware · Evidencias',
    description:
      'Reconstruye intrusiones paso a paso sobre registros de eventos y define la secuencia de contención.',
    icon: FileSearch,
  },
];

export function LandingPage({
  isAuthenticated,
  onEnterAuth,
  onEnterDashboard,
}: LandingPageProps) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % TERMINAL_LINES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero SOC Split */}
      <section className="mx-auto max-w-7xl px-6 pt-12 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs font-medium tracking-wide text-[#10b981]">
              Simulador Educativo de Ciberseguridad y Derecho Digital
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Investiga incidentes digitales con criterio técnico y jurídico
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              CiberDetective AI te sitúa al mando de un Centro de Operaciones de
              Ciberseguridad. Inspecciona correos sospechosos, logs de intrusión
              y expedientes legales reales de España y Europa con evaluación
              inteligente asistida por Gemini AI.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onEnterDashboard}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-5 py-3 text-sm font-semibold text-[#05080f] hover:bg-[#059669] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Abrir Centro de Mando</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onEnterAuth}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-5 py-3 text-sm font-semibold text-[#05080f] hover:bg-[#059669] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Acceder al Centro SOC</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onEnterAuth}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0a0f1c] px-5 py-3 text-sm font-semibold text-white hover:border-slate-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Crear expediente de agente
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Visual SOC Radar & Terminal Module */}
          <div className="lg:col-span-6">
            <div className="h-full rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <Radar className="w-4 h-4 text-[#10b981]" />
                  <span>Simulación de radar y consola forense</span>
                </div>
                <span className="font-mono text-xs text-[#10b981]">
                  ES / UE · RGPD
                </span>
              </div>

              {/* Geometric Radar Graphic */}
              <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
                <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full"
                    aria-hidden="true"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="#05080f"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="62"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="34"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <line
                      x1="10"
                      y1="100"
                      x2="190"
                      y2="100"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <line
                      x1="100"
                      y1="10"
                      x2="100"
                      y2="190"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    {/* Detected anomaly nodes */}
                    <circle cx="142" cy="64" r="4" fill="#10b981" />
                    <circle cx="66" cy="130" r="3.5" fill="#f59e0b" />
                    <circle cx="132" cy="142" r="3.5" fill="#10b981" />
                  </svg>

                  {/* Rotating Sweep Sector */}
                  <div className="pointer-events-none absolute inset-0 animate-[spin_6s_linear_infinite]">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <defs>
                        <linearGradient
                          id="radarBeam"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity="0.35"
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M100,100 L100,10 A90,90 0 0,1 164,36 Z"
                        fill="url(#radarBeam)"
                      />
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="10"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>

                {/* Live Terminal Inspection Preview */}
                <div className="flex-1 w-full rounded-lg border border-slate-800 bg-[#05080f] p-4 font-mono text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800/80 pb-2">
                    <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>consola-pericial</span>
                  </div>
                  <p className="text-slate-400">
                    $ inspect --target expediente_activo
                  </p>
                  <p className="text-[#10b981] min-h-[2.5rem] leading-relaxed">
                    {TERMINAL_LINES[lineIndex]}
                  </p>
                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Evaluación asistida</span>
                    <span className="text-white">Gemini AI</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 text-xs">
                <div>
                  <p className="text-slate-400">Ramas</p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-white tabular-nums">
                    4 áreas
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Repetición</p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-white">
                    Espaciada
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Normativa</p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-[#10b981]">
                    Verificada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Disciplines Grid */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/90 pb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Dominios de investigación operativa
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Entrena con evidencias técnicas reales y refuerza automáticamente los
              casos fallados mediante alertas de repetición espaciada.
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-[#10b981] shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {DISCIPLINES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.index}
                className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-5 h-5 text-[#10b981]" />
                    <span className="text-xs text-slate-400">
                      {item.subtitle}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-white mb-2">
                    {item.index} {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
