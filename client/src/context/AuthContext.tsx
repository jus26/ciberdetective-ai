import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  apiClient,
  getAuthToken,
  registerUnauthorizedHandler,
  setAuthToken,
} from '../services/apiClient';
import {
  LEVEL_RANKS,
  type AgentStats,
  type AgentUser,
  type BadgeItem,
} from '../types';

interface AuthContextValue {
  user: AgentUser | null;
  stats: AgentStats | null;
  loading: boolean;
  rankInfo: { titulo: string; minXp: number; nextXp: number | null };
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  applyProgression: (payload: {
    xpTotal: number;
    nivelActual: number;
    nuevasInsignias?: BadgeItem[];
  }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AgentUser | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setStats(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.getProfile();
      setUser(res.user);
      setStats(res.estadisticas);
    } catch {
      setAuthToken(null);
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setStats(null);
    });
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.login({ email, password });
    setAuthToken(res.token);
    setUser(res.user);
    try {
      const profileRes = await apiClient.getProfile();
      setStats(profileRes.estadisticas);
    } catch {
      // Optional stats refresh
    }
  }, []);

  const register = useCallback(
    async (nombre: string, email: string, password: string) => {
      const res = await apiClient.register({ nombre, email, password });
      setAuthToken(res.token);
      setUser(res.user);
      setStats({ intentosTotales: 0, misionesAprobadas: 0, tasaAcierto: 0 });
    },
    []
  );

  const applyProgression = useCallback(
    (payload: {
      xpTotal: number;
      nivelActual: number;
      nuevasInsignias?: BadgeItem[];
    }) => {
      setUser((prev) => {
        if (!prev) return prev;
        const existingIds = new Set(
          prev.insignias.map((b) => String(b._id || b.id || b.codigo))
        );
        const mergedBadges = [...prev.insignias];
        for (const badge of payload.nuevasInsignias || []) {
          const key = String(badge._id || badge.id || badge.codigo);
          if (!existingIds.has(key)) {
            mergedBadges.push(badge);
            existingIds.add(key);
          }
        }
        return {
          ...prev,
          xp: payload.xpTotal,
          nivel: payload.nivelActual,
          insignias: mergedBadges,
        };
      });
    },
    []
  );

  const rankInfo = LEVEL_RANKS[user?.nivel || 1] || LEVEL_RANKS[6];

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        rankInfo,
        login,
        register,
        logout,
        refreshProfile,
        applyProgression,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return ctx;
}
