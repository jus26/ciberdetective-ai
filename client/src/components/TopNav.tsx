import { AlertTriangle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type ClientView =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'mission'
  | 'leaderboard'
  | 'profile'
  | 'admin'
  | 'not-found';

interface TopNavProps {
  activeView: ClientView;
  pendingAlertsCount?: number;
  onNavigate: (view: ClientView) => void;
}

export function TopNav({
  activeView,
  pendingAlertsCount = 0,
  onNavigate,
}: TopNavProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleGo = (view: ClientView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  const navLinkClass = (isActive: boolean) =>
    `relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#05080f]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        {/* Zona 1: Wordmark SOC de una línea */}
        <button
          type="button"
          onClick={() => handleGo('landing')}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-[#10b981] transition-colors cursor-pointer"
        >
          CiberDetective AI
        </button>

        {/* Zona 2: Enlaces de navegación SOC */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => handleGo('landing')}
            className={navLinkClass(activeView === 'landing')}
          >
            <span>Inicio</span>
            {activeView === 'landing' && (
              <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#10b981]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleGo(user ? 'dashboard' : 'auth')}
            className={navLinkClass(
              activeView === 'dashboard' || activeView === 'mission'
            )}
          >
            <span>Centro de Mando</span>
            {user && pendingAlertsCount > 0 && (
              <span
                title={`${pendingAlertsCount} alertas de repaso activas`}
                className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-amber-950/50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300 tabular-nums"
              >
                <AlertTriangle className="w-3 h-3" />
                {pendingAlertsCount}
              </span>
            )}
            {(activeView === 'dashboard' || activeView === 'mission') && (
              <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#10b981]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleGo('leaderboard')}
            className={navLinkClass(activeView === 'leaderboard')}
          >
            <span>Clasificación</span>
            {activeView === 'leaderboard' && (
              <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#10b981]" />
            )}
          </button>

          {user && (
            <button
              type="button"
              onClick={() => handleGo('profile')}
              className={navLinkClass(activeView === 'profile')}
            >
              <span>Mi Expediente</span>
              {activeView === 'profile' && (
                <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#10b981]" />
              )}
            </button>
          )}

          {user?.rol === 'admin' && (
            <button
              type="button"
              onClick={() => handleGo('admin')}
              className={navLinkClass(activeView === 'admin')}
            >
              <span>Administración</span>
              {activeView === 'admin' && (
                <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#10b981]" />
              )}
            </button>
          )}
        </nav>

        {/* Zona 3: Acción principal del agente */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGo('profile')}
                className="rounded-lg border border-slate-700 bg-[#0a0f1c] px-4 py-2 text-xs font-semibold text-white hover:border-[#10b981] transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
              >
                {user.nombre} · Nv. {user.nivel}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  handleGo('landing');
                }}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleGo('auth')}
              className="rounded-lg bg-[#10b981] px-4 py-2 text-xs font-semibold text-[#05080f] hover:bg-[#059669] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Acceso al Terminal
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
            className="md:hidden p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0a0f1c] px-6 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleGo('landing')}
            className="block w-full text-left py-2 text-sm text-slate-200 hover:text-[#10b981] cursor-pointer"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleGo(user ? 'dashboard' : 'auth')}
            className="flex items-center justify-between w-full text-left py-2 text-sm text-slate-200 hover:text-[#10b981] cursor-pointer"
          >
            <span>Centro de Mando</span>
            {user && pendingAlertsCount > 0 && (
              <span className="font-mono text-xs text-amber-300 tabular-nums">
                {pendingAlertsCount} alertas
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleGo('leaderboard')}
            className="block w-full text-left py-2 text-sm text-slate-200 hover:text-[#10b981] cursor-pointer"
          >
            Clasificación
          </button>
          {user && (
            <button
              type="button"
              onClick={() => handleGo('profile')}
              className="block w-full text-left py-2 text-sm text-slate-200 hover:text-[#10b981] cursor-pointer"
            >
              Mi Expediente
            </button>
          )}
          {user?.rol === 'admin' && (
            <button
              type="button"
              onClick={() => handleGo('admin')}
              className="block w-full text-left py-2 text-sm text-slate-200 hover:text-[#10b981] cursor-pointer"
            >
              Administración
            </button>
          )}
        </div>
      )}
    </header>
  );
}
