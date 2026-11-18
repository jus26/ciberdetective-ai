export type UserRole = 'player' | 'admin';
export type MissionCategory = 'phishing' | 'privacy' | 'digital_law';
export type MissionDifficulty = 'inicial' | 'intermedio' | 'avanzado';
export type ArtifactType =
  | 'email'
  | 'privacy_notice'
  | 'incident_log'
  | 'legal_dossier';

export interface CategoryStats {
  phishingSolved: number;
  privacySolved: number;
  digitalLawSolved: number;
}

export interface UserProfile {
  id: string;
  codename: string;
  email: string;
  role: UserRole;
  xp: number;
  level: number;
  rankTitle: string;
  currentMinXp: number;
  nextLevelXp: number | null;
  totalScore: number;
  missionsCompleted: number;
  missionsCorrect: number;
  streak: number;
  bestStreak: number;
  unlockedAchievements: string[];
  categoryStats: CategoryStats;
  accuracy?: number;
  createdAt: string;
}

export interface MissionOption {
  id: string;
  label: string;
  text: string;
}

export interface ArtifactData {
  sender?: string;
  recipient?: string;
  subject?: string;
  headers?: string[];
  body: string;
  suspiciousIndicators?: string[];
  metadata?: Record<string, string>;
}

export interface PublicMission {
  id: string;
  slug: string;
  title: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  basePoints: number;
  brief: string;
  artifactType: ArtifactType;
  artifactData: ArtifactData;
  question: string;
  options: MissionOption[];
  solved: boolean;
}

export interface AdminMission extends PublicMission {
  correctOptionId: string;
  referenceSolution: string;
  legalContext: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AiAnalysis {
  evaluationSummary: string;
  correctAnswerReason: string;
  cybersecurityRisks: string[];
  legalExplanation: string;
  preventiveRecommendations: string[];
  justificationFeedback?: string;
}

export interface AttemptRecord {
  id: string;
  userId: string;
  missionId: string;
  missionTitle: string;
  missionCategory: MissionCategory;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  userJustification: string;
  isCorrect: boolean;
  pointsEarned: number;
  xpEarned: number;
  aiAnalysis: AiAnalysis;
  createdAt: string;
}

export interface AchievementItem {
  code: string;
  title: string;
  description: string;
  category: 'general' | 'phishing' | 'privacy' | 'digital_law' | 'mastery';
  xpBonus: number;
  iconKey: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  codename: string;
  level: number;
  xp: number;
  totalPoints: number;
  missionsSolved: number;
  accuracy: number;
}

export interface SubmitMissionResponse {
  attempt: AttemptRecord;
  isCorrect: boolean;
  correctOptionId: string;
  referenceSolution: string;
  legalContext: string;
  suspiciousIndicators: string[];
  rewards: {
    pointsEarned: number;
    xpEarned: number;
    alreadySolvedBefore: boolean;
    newlyUnlocked: AchievementItem[];
  };
  user: UserProfile | null;
}

export type AppView =
  | 'landing'
  | 'missions'
  | 'mission-play'
  | 'leaderboard'
  | 'history'
  | 'profile'
  | 'admin';

export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  phishing: 'Phishing y Estafas',
  privacy: 'Protección de Datos y Privacidad',
  digital_law: 'Derecho Digital ES / UE',
};

export const DIFFICULTY_LABELS: Record<MissionDifficulty, string> = {
  inicial: 'Inicial',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
