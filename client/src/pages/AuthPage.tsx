import { AlertCircle, ArrowLeft, KeyRound, Shield } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(nombre.trim(), email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Error al autenticar las credenciales.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (type: 'user' | 'admin') => {
    setMode('login');
    setError(null);
    if (type === 'user') {
      setEmail('detective@ciberdetective.es');
      setPassword('Detective2026!');
    } else {
      setEmail('admin@ciberdetective.es');
      setPassword('AdminSOC2026!');
    }
  };

  return (
    <section className="mx-auto max-w-xl px-6 py-12">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la portada</span>
      </button>

      <div className="rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#05080f] px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#10b981]">
            <Shield className="w-4 h-4" />
            <span>Terminal de Acceso Clasificado</span>
          </div>
          <span className="font-mono text-xs text-slate-400">JWT · HTTPS</span>
        </div>

        <div className="p-7 sm:p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {mode === 'login'
                ? 'Identificación de agente SOC'
                : 'Alta de nuevo agente investigador'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {mode === 'login'
                ? 'Introduce tus credenciales para acceder al Centro de Mando.'
                : 'Registra tu perfil para acumular experiencia, rachas e insignias.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#05080f] border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#10b981] text-[#05080f]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#10b981] text-[#05080f]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registro
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Nombre de agente
                </label>
                <input
                  id="agent-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Agente Vega"
                  className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="agent-email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Correo electrónico corporativo o personal
              </label>
              <input
                id="agent-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agente@ciberdetective.es"
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="agent-password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Clave de acceso
              </label>
              <input
                id="agent-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-slate-700 bg-[#05080f] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-[#05080f] hover:bg-[#059669] disabled:opacity-60 transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Validando credenciales...'
                  : mode === 'login'
                  ? 'Autenticar en el sistema'
                  : 'Registrar y acceder'}
              </span>
            </button>
          </form>

          <div className="pt-5 border-t border-slate-800 space-y-2.5">
            <p className="text-xs text-slate-400">
              Credenciales semilla disponibles tras ejecutar{' '}
              <code className="text-slate-200">npm run seed</code>:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs font-medium text-slate-200 hover:border-[#10b981] transition-colors cursor-pointer"
              >
                Rellenar Detective
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="rounded-lg border border-slate-700 bg-[#05080f] px-3 py-2 text-xs font-medium text-slate-200 hover:border-[#10b981] transition-colors cursor-pointer"
              >
                Rellenar Admin SOC
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
