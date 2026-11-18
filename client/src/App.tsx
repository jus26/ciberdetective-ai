import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TopNav, type ClientView } from './components/TopNav';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminPanel } from './pages/AdminPanel';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { Leaderboard } from './pages/Leaderboard';
import { MissionPlayer } from './pages/MissionPlayer';
import { ProfilePage } from './pages/ProfilePage';
import { apiClient } from './services/apiClient';

interface ParsedRoute {
  view: ClientView;
  missionId: string | null;
}

function parsePathname(pathname: string): ParsedRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { view: 'landing', missionId: null };
  if (clean === '/auth') return { view: 'auth', missionId: null };
  if (clean === '/dashboard') return { view: 'dashboard', missionId: null };
  if (clean === '/leaderboard') return { view: 'leaderboard', missionId: null };
  if (clean === '/perfil') return { view: 'profile', missionId: null };
  if (clean === '/admin') return { view: 'admin', missionId: null };

  const missionMatch = clean.match(/^\/misiones\/([^/]+)$/);
  if (missionMatch) {
    return { view: 'mission', missionId: decodeURIComponent(missionMatch[1]) };
  }

  return { view: 'not-found', missionId: null };
}

function buildPath(view: ClientView, missionId?: string | null): string {
  switch (view) {
    case 'landing':
      return '/';
    case 'auth':
      return '/auth';
    case 'dashboard':
      return '/dashboard';
    case 'leaderboard':
      return '/leaderboard';
    case 'profile':
      return '/perfil';
    case 'admin':
      return '/admin';
    case 'mission':
      return missionId ? `/misiones/${encodeURIComponent(missionId)}` : '/dashboard';
    default:
      return '/404';
  }
}

function ClientShell() {
  const { user, loading } = useAuth();
  const initial = parsePathname(window.location.pathname);
  const [view, setView] = useState<ClientView>(initial.view);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(
    initial.missionId
  );
  const [pendingAlertsCount, setPendingAlertsCount] = useState(0);

  const refreshAlertsCount = useCallback(async () => {
    if (!user) {
      setPendingAlertsCount(0);
      return;
    }
    try {
      const res = await apiClient.getPendingAlerts(false);
      setPendingAlertsCount(res.alertasPendientes.length);
    } catch {
      // Silencioso en la barra superior para no bloquear navegación
    }
  }, [user]);

  useEffect(() => {
    refreshAlertsCount();
  }, [refreshAlertsCount]);

  useEffect(() => {
    const onPopState = () => {
      const next = parsePathname(window.location.pathname);
      setView(next.view);
      setActiveMissionId(next.missionId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const syncHistory = (nextView: ClientView, missionId?: string | null) => {
    const targetPath = buildPath(nextView, missionId);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleNavigate = (next: ClientView) => {
    const requiresAuth =
      next === 'dashboard' ||
      next === 'mission' ||
      next === 'profile' ||
      next === 'admin';

    if (requiresAuth && !user) {
      setView('auth');
      syncHistory('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (next === 'mission' && !activeMissionId) {
      setView('dashboard');
      syncHistory('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setView(next);
    syncHistory(next, activeMissionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayMission = (missionId: string) => {
    if (!user) {
      setView('auth');
      syncHistory('auth');
      return;
    }
    setActiveMissionId(missionId);
    setView('mission');
    syncHistory('mission', missionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080f] text-white flex items-center justify-center text-sm font-mono">
        Inicializando sesión SOC...
      </div>
    );
  }

  const isProtectedUnauth =
    (view === 'dashboard' ||
      view === 'mission' ||
      view === 'profile' ||
      view === 'admin') &&
    !user;

  return (
    <div className="min-h-screen flex flex-col bg-[#05080f] text-white">
      <TopNav
        activeView={isProtectedUnauth ? 'auth' : view}
        pendingAlertsCount={pendingAlertsCount}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {view === 'landing' && (
          <LandingPage
            isAuthenticated={Boolean(user)}
            onEnterAuth={() => handleNavigate('auth')}
            onEnterDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {(view === 'auth' || isProtectedUnauth) && (
          <AuthPage
            onSuccess={() => handleNavigate('dashboard')}
            onBack={() => handleNavigate('landing')}
          />
        )}

        {view === 'dashboard' && user && (
          <Dashboard onPlayMission={handlePlayMission} />
        )}

        {view === 'mission' && user && activeMissionId && (
          <MissionPlayer
            missionId={activeMissionId}
            onBack={() => {
              refreshAlertsCount();
              handleNavigate('dashboard');
            }}
            onMissionAnswered={refreshAlertsCount}
          />
        )}

        {view === 'leaderboard' && <Leaderboard />}

        {view === 'profile' && user && (
          <ProfilePage onPlayMission={handlePlayMission} />
        )}

        {view === 'admin' && user && (
          <>
            {user.rol === 'admin' ? (
              <AdminPanel />
            ) : (
              <section className="mx-auto max-w-2xl px-6 py-20 text-center space-y-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-red-500/40 bg-red-950/30 text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Acceso denegado (403)
                </h1>
                <p className="text-sm text-slate-400">
                  Esta consola está restringida a operadores con rol de
                  administrador SOC.
                </p>
                <button
                  type="button"
                  onClick={() => handleNavigate('dashboard')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-xs font-semibold text-[#05080f] hover:bg-[#059669] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Centro de Mando</span>
                </button>
              </section>
            )}
          </>
        )}

        {view === 'not-found' && (
          <section className="mx-auto max-w-2xl px-6 py-24 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="font-mono text-xs text-[#10b981]">ERROR 404 · SOC</p>
            <h1 className="font-display text-3xl font-bold text-white">
              Expediente o ruta no localizada
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              La dirección solicitada no corresponde a ningún módulo activo de
              CiberDetective AI o el caso ha sido archivado.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('landing')}
                className="rounded-lg border border-slate-700 bg-[#0a0f1c] px-4 py-2.5 text-xs font-semibold text-white hover:border-[#10b981] transition-colors cursor-pointer"
              >
                Ir a Inicio
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => handleNavigate('dashboard')}
                  className="rounded-lg bg-[#10b981] px-4 py-2.5 text-xs font-semibold text-[#05080f] hover:bg-[#059669] transition-colors cursor-pointer"
                >
                  Abrir Centro de Mando
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800/90 bg-[#05080f] py-6 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            CiberDetective AI · Plataforma educativa de ciberseguridad y derecho
            digital
          </span>
          <span>RGPD · LOPDGDD · LSSI-CE · Código Penal</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClientShell />
    </AuthProvider>
  );
}
