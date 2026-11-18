import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AppView } from '../types';

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
}

export function Navbar({ activeView, onNavigate, onOpenAuth }: NavbarProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AppView; label: string; requiresAuth?: boolean; adminOnly?: boolean }[] = [
    { id: 'landing', label: 'Inicio' },
    { id: 'missions', label: 'Misiones' },
    { id: 'leaderboard', label: 'Clasificación' },
    { id: 'history', label: 'Historial', requiresAuth: true },
    { id: 'admin', label: 'Administración', adminOnly: true },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly) return user?.role === 'admin';
    if (item.requiresAuth) return Boolean(user);
    return true;
  });

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#050A14]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('landing')}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          CiberDetective AI
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {visibleNavItems.map((item) => {
            const isActive =
              activeView === item.id ||
              (item.id === 'missions' && activeView === 'mission-play');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-emerald-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                activeView === 'profile'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-[#0B1324] text-slate-100 border-slate-700 hover:border-emerald-500/70'
              }`}
            >
              {user.codename} · Nv. {user.level}
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Iniciar sesión
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            className="md:hidden p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070E1D] px-6 py-4">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            {visibleNavItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-2 transition-colors ${
                    isActive ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
