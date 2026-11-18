export type UserRole = 'user' | 'admin';

export type MissionCategoria =
  | 'phishing'
  | 'privacidad'
  | 'derecho_digital'
  | 'forense';

export type MissionDificultad = 'facil' | 'medio' | 'experto';

export interface BadgeItem {
  _id?: string;
  id?: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  condicionTipo: string;
  condicionValor: number;
  desbloqueada?: boolean;
}

export interface AgentUser {
  id: string;
  nombre: string;
  email: string;
  nivel: number;
  xp: number;
  rachaDias: number;
  ultimaConexion: string;
  insignias: BadgeItem[];
  rol: UserRole;
  createdAt?: string;
}

export interface AgentStats {
  intentosTotales: number;
  misionesAprobadas: number;
  tasaAcierto: number;
}

export interface SimulatedEmail {
  remitente: string;
  destinatario: string;
  asunto: string;
  cabeceras: string[];
  cuerpo: string;
}

export interface Evidencias {
  correosSimulados: SimulatedEmail[];
  logs: string[];
  metadatos: Record<string, string>;
  extractosLegales: string[];
}

export interface OpcionTest {
  id: string;
  etiqueta: string;
  texto: string;
}

export interface MissionItem {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: MissionCategoria;
  dificultad: MissionDificultad;
  tiempoLimiteSegundos: number;
  xpRecompensa: number;
  evidencias: Evidencias;
  preguntaPrincipal: string;
  opcionesTest: OpcionTest[];
  resuelta: boolean;
}

export interface FeedbackIA {
  aprobado: boolean;
  puntuacion: number;
  explicacionTecnica: string;
  riesgosCiberseguridad: string[];
  marcoJuridicoSencillo: string;
  recomendacionesPreventivas: string[];
  preguntaDebate: string;
}

export interface AttemptRecord {
  _id: string;
  userId: string;
  missionId: string;
  respuestaUsuario: {
    opcionId: string;
    justificacion: string;
    tiempoEmpleadoSegundos: number;
  };
  puntuacionObtenida: number;
  feedbackIA: FeedbackIA;
  aprobado: boolean;
  fechaProximaAlerta: string | null;
  createdAt: string;
}

export interface AnswerMissionResponse {
  ok: boolean;
  intento: AttemptRecord;
  xpGanada: number;
  nivelActual: number;
  xpTotal: number;
  nuevasInsignias: BadgeItem[];
  opcionCorrectaId?: string;
  solucionReferencia: string;
  marcoLegalReal: string;
}

export interface PendingAlert {
  attemptId: string;
  mision: {
    _id: string;
    titulo: string;
    categoria: MissionCategoria;
    dificultad: MissionDificultad;
    xpRecompensa: number;
  } | null;
  ultimaPuntuacion: number;
  fechaProximaAlerta: string;
  vencida: boolean;
}

export interface RankingEntry {
  posicion: number;
  userId: string;
  nombre: string;
  nivel: number;
  xp: number;
  rachaDias: number;
  totalInsignias: number;
  insignias: BadgeItem[];
  misionesAprobadas: number;
  tasaAcierto: number;
}

export interface DebateCommentItem {
  _id?: string;
  userId: string;
  autor: string;
  texto: string;
  fecha: string;
}

export interface DebatePostItem {
  id: string;
  missionId: string;
  userId: string;
  autorNombre: string;
  argumento: string;
  totalVotos: number;
  votos: string[];
  comentarios: DebateCommentItem[];
  createdAt: string;
}

export interface HistoryAttemptItem {
  _id: string;
  userId: string;
  missionId: {
    _id: string;
    titulo: string;
    categoria: MissionCategoria;
    dificultad: MissionDificultad;
    xpRecompensa: number;
  } | null;
  respuestaUsuario: {
    opcionId: string;
    justificacion: string;
    tiempoEmpleadoSegundos: number;
  };
  puntuacionObtenida: number;
  feedbackIA: FeedbackIA;
  aprobado: boolean;
  fechaProximaAlerta: string | null;
  createdAt: string;
}

export interface AdminOptionInput {
  id: string;
  etiqueta: string;
  texto: string;
  esCorrecta: boolean;
}

export interface AdminMissionItem {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: MissionCategoria;
  dificultad: MissionDificultad;
  tiempoLimiteSegundos: number;
  xpRecompensa: number;
  evidencias: Evidencias;
  preguntaPrincipal: string;
  opcionesTest: AdminOptionInput[];
  solucionReferencia: string;
  marcoLegalReal: string;
  activa: boolean;
}

export const CATEGORIA_LABELS: Record<MissionCategoria, string> = {
  phishing: 'Phishing y Estafas',
  privacidad: 'Privacidad y Datos',
  derecho_digital: 'Derecho Digital',
  forense: 'Análisis Forense',
};

export const DIFICULTAD_LABELS: Record<MissionDificultad, string> = {
  facil: 'Inicial',
  medio: 'Medio',
  experto: 'Experto',
};

export const LEVEL_RANKS: Record<number, { titulo: string; minXp: number; nextXp: number | null }> = {
  1: { titulo: 'Analista Júnior', minXp: 0, nextXp: 250 },
  2: { titulo: 'Investigador Digital', minXp: 250, nextXp: 600 },
  3: { titulo: 'Especialista SOC', minXp: 600, nextXp: 1100 },
  4: { titulo: 'Perito Forense', minXp: 1100, nextXp: 1800 },
  5: { titulo: 'Delegado de Cumplimiento', minXp: 1800, nextXp: 3000 },
  6: { titulo: 'Director de Ciberinteligencia', minXp: 3000, nextXp: null },
};
