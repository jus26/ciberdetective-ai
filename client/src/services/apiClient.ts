import type {
  AdminMissionItem,
  AgentStats,
  AgentUser,
  AnswerMissionResponse,
  BadgeItem,
  DebatePostItem,
  HistoryAttemptItem,
  MissionCategoria,
  MissionDificultad,
  MissionItem,
  PendingAlert,
  RankingEntry,
} from '../types';

const API_BASE_URL = (
  (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_API_URL || 'http://localhost:4000/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'ciberdetective_jwt_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorizedCallback = handler;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Cliente Fetch con interceptores de petición (inyección JWT)
 * y de respuesta (normalización de errores y gestión de 401).
 */
async function requestWithInterceptors<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor del SOC. Verifica que el backend esté activo.',
      0
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token && onUnauthorizedCallback) {
      setAuthToken(null);
      onUnauthorizedCallback();
    }
    const message =
      data?.error || `Error en la operación solicitada (HTTP ${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const apiClient = {
  // Auth
  register: (payload: { nombre: string; email: string; password: string }) =>
    requestWithInterceptors<{ ok: boolean; token: string; user: AgentUser }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  login: (payload: { email: string; password: string }) =>
    requestWithInterceptors<{ ok: boolean; token: string; user: AgentUser }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  getProfile: () =>
    requestWithInterceptors<{
      ok: boolean;
      user: AgentUser;
      estadisticas: AgentStats;
    }>('/auth/profile'),

  // Misiones
  listMissions: (filters?: {
    categoria?: MissionCategoria | 'todas';
    dificultad?: MissionDificultad | 'todas';
  }) => {
    const params = new URLSearchParams();
    if (filters?.categoria && filters.categoria !== 'todas') {
      params.set('categoria', filters.categoria);
    }
    if (filters?.dificultad && filters.dificultad !== 'todas') {
      params.set('dificultad', filters.dificultad);
    }
    const qs = params.toString();
    return requestWithInterceptors<{ ok: boolean; misiones: MissionItem[] }>(
      `/missions${qs ? `?${qs}` : ''}`
    );
  },

  getMissionDetail: (missionId: string) =>
    requestWithInterceptors<{ ok: boolean; mision: MissionItem }>(
      `/missions/${missionId}`
    ),

  answerMission: (
    missionId: string,
    payload: {
      opcionId: string;
      justificacion: string;
      tiempoEmpleadoSegundos: number;
    }
  ) =>
    requestWithInterceptors<AnswerMissionResponse>(
      `/missions/${missionId}/responder`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  // Administración de misiones
  adminListMissions: () =>
    requestWithInterceptors<{ ok: boolean; misiones: AdminMissionItem[] }>(
      '/missions/admin/all'
    ),

  adminCreateMission: (payload: Omit<AdminMissionItem, 'id'>) =>
    requestWithInterceptors<{ ok: boolean; mision: AdminMissionItem }>(
      '/missions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  adminUpdateMission: (id: string, payload: Omit<AdminMissionItem, 'id'>) =>
    requestWithInterceptors<{ ok: boolean; mision: AdminMissionItem }>(
      `/missions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    ),

  adminDeleteMission: (id: string) =>
    requestWithInterceptors<{ ok: boolean; eliminada: boolean }>(
      `/missions/${id}`,
      {
        method: 'DELETE',
      }
    ),

  // Gamificación e Historial
  getRanking: (limit = 25) =>
    requestWithInterceptors<{ ok: boolean; ranking: RankingEntry[] }>(
      `/gamification/ranking?limit=${limit}`
    ),

  getPendingAlerts: (incluirProximas = true) =>
    requestWithInterceptors<{
      ok: boolean;
      alertasPendientes: PendingAlert[];
    }>(`/gamification/alertas?incluirProximas=${incluirProximas}`),

  getHistory: () =>
    requestWithInterceptors<{ ok: boolean; historial: HistoryAttemptItem[] }>(
      '/gamification/historial'
    ),

  getBadges: () =>
    requestWithInterceptors<{ ok: boolean; insignias: BadgeItem[] }>(
      '/gamification/insignias'
    ),

  // Foro de Debate
  listDebates: (missionId: string) =>
    requestWithInterceptors<{
      ok: boolean;
      publicaciones: DebatePostItem[];
    }>(`/debates/mision/${missionId}`),

  createDebatePost: (missionId: string, argumento: string) =>
    requestWithInterceptors<{ ok: boolean; publicacion: unknown }>(
      `/debates/mision/${missionId}`,
      {
        method: 'POST',
        body: JSON.stringify({ argumento }),
      }
    ),

  commentDebatePost: (postId: string, texto: string) =>
    requestWithInterceptors<{ ok: boolean; publicacion: unknown }>(
      `/debates/${postId}/comentar`,
      {
        method: 'POST',
        body: JSON.stringify({ texto }),
      }
    ),

  toggleVoteDebatePost: (postId: string) =>
    requestWithInterceptors<{
      ok: boolean;
      votado: boolean;
      totalVotos: number;
    }>(`/debates/${postId}/votar`, {
      method: 'PATCH',
    }),
};
