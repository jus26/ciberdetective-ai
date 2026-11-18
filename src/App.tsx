import { useCallback, useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { HistoryView } from './components/HistoryView';
import { LandingView } from './components/LandingView';
import { LeaderboardView } from './components/LeaderboardView';
import { MissionWorkspace } from './components/MissionWorkspace';
import { MissionsHub } from './components/MissionsHub';
import { Navbar } from './components/Navbar';
import { ProfileView } from './components/ProfileView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import type { AppView, MissionCategory, PublicMission } from './types';

function CiberDetectiveShell() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [missions, setMissions] = useState<PublicMission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [initialCategory, setInitialCategory] = useState<
    MissionCategory | 'all'
  >('all');
  const [selectedMission, setSelectedMission] = useState<PublicMission | null>(
    null
  );
  const [stats, setStats] = useState({
    usersCount: 2,
    missionsCount: 9,
    attemptsCount: 0,
  });

  const refreshMissionsAndStats = useCallback(async () => {
    setMissionsLoading(true);
    try {
      const [missionsRes, summaryRes] = await Promise.all([
        api.listMissions(),
        api.getSummary(),
      ]);
      setMissions(missionsRes.missions);
      setStats(summaryRes.stats);
    } catch {
      // Keep previous data on transient error
    } finally {
      setMissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMissionsAndStats();
  }, [refreshMissionsAndStats, user?.id]);

  const handleNavigate = (view: AppView) => {
    if ((view === 'history' || view === 'profile') && !user) {
      setAuthModalOpen(true);
      return;
    }
    if (view === 'admin' && user?.role !== 'admin') {
      setActiveView('landing');
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartMissions = (category?: MissionCategory) => {
    setInitialCategory(category || 'all');
    setActiveView('missions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMission = (mission: PublicMission) => {
    setSelectedMission(mission);
    setActiveView('mission-play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    setActiveView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050A14] text-slate-100">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingView
            stats={stats}
            onStartMissions={handleStartMissions}
            onOpenAuth={() => setAuthModalOpen(true)}
            isAuthenticated={Boolean(user)}
          />
        )}

        {activeView === 'missions' && (
          <MissionsHub
            missions={missions}
            loading={missionsLoading}
            initialCategory={initialCategory}
            onSelectMission={handleSelectMission}
          />
        )}

        {activeView === 'mission-play' && selectedMission && (
          <MissionWorkspace
            mission={selectedMission}
            onBack={() => setActiveView('missions')}
            onOpenAuth={() => setAuthModalOpen(true)}
            onMissionSolved={refreshMissionsAndStats}
          />
        )}

        {activeView === 'leaderboard' && <LeaderboardView />}

        {activeView === 'history' && user && (
          <HistoryView onGoToMissions={() => handleStartMissions()} />
        )}

        {activeView === 'profile' && user && (
          <ProfileView
            onLogout={handleLogout}
            onGoToMissions={() => handleStartMissions()}
          />
        )}

        {activeView === 'admin' && user?.role === 'admin' && (
          <AdminPanel onMissionsChanged={refreshMissionsAndStats} />
        )}
      </main>

      <footer className="border-t border-slate-800/90 bg-[#040811] py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            CiberDetective AI · Plataforma educativa de ciberseguridad y derecho
            digital español y europeo
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavigate('missions')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Misiones
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('leaderboard')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Clasificación
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={refreshMissionsAndStats}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CiberDetectiveShell />
    </AuthProvider>
  );
}
