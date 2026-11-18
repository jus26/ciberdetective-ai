import { AlertCircle, Shield, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(codename.trim(), email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoUser = (role: 'player' | 'admin') => {
    setMode('login');
    setError(null);
    if (role === 'player') {
      setEmail('detective@ciberdetective.es');
      setPassword('Detective2026!');
    } else {
      setEmail('admin@ciberdetective.es');
      setPassword('AdminSOC2026!');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#091224] p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1.5">
              <Shield className="w-4 h-4" />
              <span>Acceso Seguro</span>
            </div>
            <h2
              id="auth-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              {mode === 'login'
                ? 'Iniciar sesión en CiberDetective AI'
                : 'Crear cuenta de detective'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#050A14] border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[#0F1A33] text-white'
                : 'text-slate-400 hover:text-slate-200'
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
                ? 'bg-[#0F1A33] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-codename"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Alias de detective
              </label>
              <input
                id="auth-codename"
                type="text"
                required
                minLength={3}
                maxLength={28}
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="Ej. Analista_Norte"
                className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@organizacion.es"
              className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-lg border border-slate-700 bg-[#050A14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {submitting
              ? 'Verificando credenciales...'
              : mode === 'login'
              ? 'Entrar en la plataforma'
              : 'Crear cuenta y empezar'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2.5">
            Cuentas de demostración disponibles para pruebas rápidas:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemoUser('player')}
              className="rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-xs font-medium text-slate-200 hover:border-emerald-500/60 transition-colors cursor-pointer"
            >
              Cargar Detective
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('admin')}
              className="rounded-lg border border-slate-700 bg-[#050A14] px-3 py-2 text-xs font-medium text-slate-200 hover:border-emerald-500/60 transition-colors cursor-pointer"
            >
              Cargar Admin SOC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
