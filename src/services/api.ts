import type {
  AchievementItem,
  AdminMission,
  AttemptRecord,
  LeaderboardEntry,
  PublicMission,
  SubmitMissionResponse,
  UserProfile,
} from '../types';

const TOKEN_STORAGE_KEY = 'ciberdetective_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error || `Error de comunicación con el servidor (${response.status}).`
    );
  }
  return data as T;
}

export const api = {
  getSummary: () =>
    apiFetch<{
      stats: { usersCount: number; missionsCount: number; attemptsCount: number };
    }>('/summary'),

  register: (payload: { codename: string; email: string; password: string }) =>
    apiFetch<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiFetch<{ user: UserProfile }>('/auth/me'),

  listMissions: () => apiFetch<{ missions: PublicMission[] }>('/missions'),

  getMission: (id: string) =>
    apiFetch<{ mission: PublicMission }>(`/missions/${id}`),

  submitMission: (
    id: string,
    payload: { selectedOptionId: string; userJustification: string }
  ) =>
    apiFetch<SubmitMissionResponse>(`/missions/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () =>
    apiFetch<{
      profile: UserProfile;
      achievements: AchievementItem[];
      recentAttempts: AttemptRecord[];
    }>('/profile'),

  getHistory: () => apiFetch<{ history: AttemptRecord[] }>('/history'),

  getLeaderboard: () =>
    apiFetch<{ leaderboard: LeaderboardEntry[] }>('/leaderboard'),

  getAchievements: () =>
    apiFetch<{ achievements: AchievementItem[] }>('/achievements'),

  // Admin endpoints
  adminListMissions: () =>
    apiFetch<{
      missions: AdminMission[];
      stats: { usersCount: number; missionsCount: number; attemptsCount: number };
    }>('/admin/missions'),

  adminCreateMission: (payload: Record<string, unknown>) =>
    apiFetch<{ mission: AdminMission }>('/admin/missions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminUpdateMission: (id: string, payload: Record<string, unknown>) =>
    apiFetch<{ mission: AdminMission }>(`/admin/missions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  adminToggleMission: (id: string) =>
    apiFetch<{ mission: AdminMission }>(`/admin/missions/${id}/toggle`, {
      method: 'PATCH',
    }),

  adminDeleteMission: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/missions/${id}`, {
      method: 'DELETE',
    }),
};
