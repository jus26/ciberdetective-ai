import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isMongoConnected } from '../config/database.ts';
import { AchievementModel } from '../models/Achievement.ts';
import { AttemptModel, type IAiAnalysis } from '../models/Attempt.ts';
import { MissionModel, type MissionCategory, type MissionDifficulty, type ArtifactType } from '../models/Mission.ts';
import { ScoreModel } from '../models/Score.ts';
import { UserModel, type ICategoryStats, type UserRole } from '../models/User.ts';
import { SEED_ACHIEVEMENTS, SEED_MISSIONS, getDefaultSeedUsers } from './seedData.ts';

export interface StoredUser {
  id: string;
  codename: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  xp: number;
  level: number;
  totalScore: number;
  missionsCompleted: number;
  missionsCorrect: number;
  streak: number;
  bestStreak: number;
  unlockedAchievements: string[];
  categoryStats: ICategoryStats;
  createdAt: string;
}

export interface StoredMission {
  id: string;
  slug: string;
  title: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  basePoints: number;
  brief: string;
  artifactType: ArtifactType;
  artifactData: {
    sender?: string;
    recipient?: string;
    subject?: string;
    headers?: string[];
    body: string;
    suspiciousIndicators?: string[];
    metadata?: Record<string, string>;
  };
  question: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
  referenceSolution: string;
  legalContext: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface StoredAttempt {
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
  aiAnalysis: IAiAnalysis;
  createdAt: string;
}

export interface StoredAchievement {
  code: string;
  title: string;
  description: string;
  category: 'general' | 'phishing' | 'privacy' | 'digital_law' | 'mastery';
  xpBonus: number;
  iconKey: string;
}

interface LocalDbFile {
  users: StoredUser[];
  missions: StoredMission[];
  attempts: StoredAttempt[];
  achievements: StoredAchievement[];
}

const LOCAL_DB_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, 'local-store.json');

function readLocalDb(): LocalDbFile {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    return { users: [], missions: [], attempts: [], achievements: [] };
  }
  const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
  return JSON.parse(raw) as LocalDbFile;
}

function writeLocalDb(db: LocalDbFile): void {
  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function mapMongoUser(doc: any): StoredUser {
  return {
    id: String(doc._id),
    codename: doc.codename,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    xp: doc.xp,
    level: doc.level,
    totalScore: doc.totalScore,
    missionsCompleted: doc.missionsCompleted,
    missionsCorrect: doc.missionsCorrect,
    streak: doc.streak,
    bestStreak: doc.bestStreak,
    unlockedAchievements: doc.unlockedAchievements || [],
    categoryStats: doc.categoryStats || {
      phishingSolved: 0,
      privacySolved: 0,
      digitalLawSolved: 0,
    },
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

function mapMongoMission(doc: any): StoredMission {
  const rawArtifact = doc.artifactData || {};
  let metadataObj: Record<string, string> | undefined;
  if (rawArtifact.metadata instanceof Map) {
    metadataObj = Object.fromEntries(rawArtifact.metadata.entries());
  } else if (rawArtifact.metadata && typeof rawArtifact.metadata === 'object') {
    metadataObj = rawArtifact.metadata;
  }

  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    difficulty: doc.difficulty,
    xpReward: doc.xpReward,
    basePoints: doc.basePoints,
    brief: doc.brief,
    artifactType: doc.artifactType,
    artifactData: {
      sender: rawArtifact.sender,
      recipient: rawArtifact.recipient,
      subject: rawArtifact.subject,
      headers: rawArtifact.headers || [],
      body: rawArtifact.body,
      suspiciousIndicators: rawArtifact.suspiciousIndicators || [],
      metadata: metadataObj,
    },
    question: doc.question,
    options: doc.options,
    correctOptionId: doc.correctOptionId,
    referenceSolution: doc.referenceSolution,
    legalContext: doc.legalContext,
    isActive: Boolean(doc.isActive),
    createdBy: doc.createdBy || 'system',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

function mapMongoAttempt(doc: any): StoredAttempt {
  return {
    id: String(doc._id),
    userId: doc.userId,
    missionId: doc.missionId,
    missionTitle: doc.missionTitle,
    missionCategory: doc.missionCategory,
    selectedOptionId: doc.selectedOptionId,
    selectedOptionText: doc.selectedOptionText,
    correctOptionId: doc.correctOptionId,
    userJustification: doc.userJustification || '',
    isCorrect: Boolean(doc.isCorrect),
    pointsEarned: doc.pointsEarned,
    xpEarned: doc.xpEarned,
    aiAnalysis: doc.aiAnalysis,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function initializeSeedData(): Promise<void> {
  if (isMongoConnected()) {
    for (const ach of SEED_ACHIEVEMENTS) {
      await AchievementModel.updateOne(
        { code: ach.code },
        { $setOnInsert: ach },
        { upsert: true }
      );
    }

    const missionCount = await MissionModel.countDocuments();
    if (missionCount === 0) {
      await MissionModel.insertMany(SEED_MISSIONS);
      console.log(`[Seed] ${SEED_MISSIONS.length} misiones iniciales creadas en MongoDB.`);
    }

    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const seedUsers = await getDefaultSeedUsers();
      for (const u of seedUsers) {
        const created = await UserModel.create(u);
        await ScoreModel.create({
          userId: String(created._id),
          codename: created.codename,
          level: created.level,
          xp: created.xp,
          totalPoints: created.totalScore,
          missionsSolved: created.missionsCorrect,
          accuracy:
            created.missionsCompleted > 0
              ? Math.round((created.missionsCorrect / created.missionsCompleted) * 100)
              : 0,
        });
      }
      console.log('[Seed] Usuarios iniciales creados en MongoDB.');
    }
    return;
  }

  // Local JSON fallback store initialization
  const db = readLocalDb();
  let changed = false;

  if (db.achievements.length === 0) {
    db.achievements = SEED_ACHIEVEMENTS;
    changed = true;
  }

  if (db.missions.length === 0) {
    db.missions = SEED_MISSIONS.map((m) => ({
      ...m,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));
    changed = true;
  }

  if (db.users.length === 0) {
    const seedUsers = await getDefaultSeedUsers();
    db.users = seedUsers.map((u) => ({
      ...u,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));
    changed = true;
  }

  if (changed) {
    writeLocalDb(db);
    console.log('[Seed] Datos iniciales preparados en almacenamiento local.');
  }
}

export const dataStore = {
  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({ email: normalized }).lean();
      return doc ? mapMongoUser(doc) : null;
    }
    const db = readLocalDb();
    return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id: string): Promise<StoredUser | null> {
    if (isMongoConnected()) {
      const doc = await UserModel.findById(id).lean();
      return doc ? mapMongoUser(doc) : null;
    }
    const db = readLocalDb();
    return db.users.find((u) => u.id === id) || null;
  },

  async createUser(input: {
    codename: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<StoredUser> {
    if (isMongoConnected()) {
      const created = await UserModel.create({
        codename: input.codename,
        email: input.email.toLowerCase().trim(),
        passwordHash: input.passwordHash,
        role: input.role || 'player',
      });
      await ScoreModel.create({
        userId: String(created._id),
        codename: created.codename,
        level: 1,
        xp: 0,
        totalPoints: 0,
        missionsSolved: 0,
        accuracy: 0,
      });
      return mapMongoUser(created);
    }

    const db = readLocalDb();
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      codename: input.codename,
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      role: input.role || 'player',
      xp: 0,
      level: 1,
      totalScore: 0,
      missionsCompleted: 0,
      missionsCorrect: 0,
      streak: 0,
      bestStreak: 0,
      unlockedAchievements: [],
      categoryStats: { phishingSolved: 0, privacySolved: 0, digitalLawSolved: 0 },
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeLocalDb(db);
    return newUser;
  },

  async updateUserProgress(userId: string, patch: Partial<StoredUser>): Promise<StoredUser | null> {
    if (isMongoConnected()) {
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { $set: patch },
        { new: true }
      ).lean();
      if (!updated) return null;
      const mapped = mapMongoUser(updated);
      const accuracy =
        mapped.missionsCompleted > 0
          ? Math.round((mapped.missionsCorrect / mapped.missionsCompleted) * 100)
          : 0;
      await ScoreModel.findOneAndUpdate(
        { userId: mapped.id },
        {
          $set: {
            codename: mapped.codename,
            level: mapped.level,
            xp: mapped.xp,
            totalPoints: mapped.totalScore,
            missionsSolved: mapped.missionsCorrect,
            accuracy,
          },
        },
        { upsert: true }
      );
      return mapped;
    }

    const db = readLocalDb();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...patch };
    writeLocalDb(db);
    return db.users[idx];
  },

  async getLeaderboard(limit = 25) {
    if (isMongoConnected()) {
      const scores = await ScoreModel.find()
        .sort({ totalPoints: -1, xp: -1 })
        .limit(limit)
        .lean();
      return scores.map((s: any, idx: number) => ({
        rank: idx + 1,
        userId: s.userId,
        codename: s.codename,
        level: s.level,
        xp: s.xp,
        totalPoints: s.totalPoints,
        missionsSolved: s.missionsSolved,
        accuracy: s.accuracy,
      }));
    }

    const db = readLocalDb();
    return [...db.users]
      .sort((a, b) => b.totalScore - a.totalScore || b.xp - a.xp)
      .slice(0, limit)
      .map((u, idx) => ({
        rank: idx + 1,
        userId: u.id,
        codename: u.codename,
        level: u.level,
        xp: u.xp,
        totalPoints: u.totalScore,
        missionsSolved: u.missionsCorrect,
        accuracy:
          u.missionsCompleted > 0
            ? Math.round((u.missionsCorrect / u.missionsCompleted) * 100)
            : 0,
      }));
  },

  async listMissions(includeInactive = false): Promise<StoredMission[]> {
    if (isMongoConnected()) {
      const filter = includeInactive ? {} : { isActive: true };
      const docs = await MissionModel.find(filter).sort({ createdAt: 1 }).lean();
      return docs.map(mapMongoMission);
    }

    const db = readLocalDb();
    return db.missions.filter((m) => (includeInactive ? true : m.isActive));
  },

  async findMissionById(id: string): Promise<StoredMission | null> {
    if (isMongoConnected()) {
      const doc = await MissionModel.findById(id).lean();
      return doc ? mapMongoMission(doc) : null;
    }
    const db = readLocalDb();
    return db.missions.find((m) => m.id === id) || null;
  },

  async createMission(input: Omit<StoredMission, 'id' | 'createdAt'>): Promise<StoredMission> {
    if (isMongoConnected()) {
      const created = await MissionModel.create(input);
      return mapMongoMission(created);
    }
    const db = readLocalDb();
    const created: StoredMission = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.missions.push(created);
    writeLocalDb(db);
    return created;
  },

  async updateMission(
    id: string,
    patch: Partial<Omit<StoredMission, 'id' | 'createdAt'>>
  ): Promise<StoredMission | null> {
    if (isMongoConnected()) {
      const updated = await MissionModel.findByIdAndUpdate(
        id,
        { $set: patch },
        { new: true }
      ).lean();
      return updated ? mapMongoMission(updated) : null;
    }
    const db = readLocalDb();
    const idx = db.missions.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    db.missions[idx] = { ...db.missions[idx], ...patch };
    writeLocalDb(db);
    return db.missions[idx];
  },

  async deleteMission(id: string): Promise<boolean> {
    if (isMongoConnected()) {
      const res = await MissionModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const db = readLocalDb();
    const prevLen = db.missions.length;
    db.missions = db.missions.filter((m) => m.id !== id);
    if (db.missions.length !== prevLen) {
      writeLocalDb(db);
      return true;
    }
    return false;
  },

  async createAttempt(input: Omit<StoredAttempt, 'id' | 'createdAt'>): Promise<StoredAttempt> {
    if (isMongoConnected()) {
      const created = await AttemptModel.create(input);
      return mapMongoAttempt(created);
    }
    const db = readLocalDb();
    const created: StoredAttempt = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.attempts.unshift(created);
    writeLocalDb(db);
    return created;
  },

  async getUserAttempts(userId: string, limit = 50): Promise<StoredAttempt[]> {
    if (isMongoConnected()) {
      const docs = await AttemptModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      return docs.map(mapMongoAttempt);
    }
    const db = readLocalDb();
    return db.attempts.filter((a) => a.userId === userId).slice(0, limit);
  },

  async hasUserSolvedMission(userId: string, missionId: string): Promise<boolean> {
    if (isMongoConnected()) {
      const existing = await AttemptModel.findOne({
        userId,
        missionId,
        isCorrect: true,
      }).lean();
      return Boolean(existing);
    }
    const db = readLocalDb();
    return db.attempts.some(
      (a) => a.userId === userId && a.missionId === missionId && a.isCorrect
    );
  },

  async listAchievements(): Promise<StoredAchievement[]> {
    if (isMongoConnected()) {
      const docs = await AchievementModel.find().lean();
      return docs.map((d: any) => ({
        code: d.code,
        title: d.title,
        description: d.description,
        category: d.category,
        xpBonus: d.xpBonus,
        iconKey: d.iconKey,
      }));
    }
    const db = readLocalDb();
    return db.achievements;
  },

  async getPlatformStats() {
    if (isMongoConnected()) {
      const [usersCount, missionsCount, attemptsCount] = await Promise.all([
        UserModel.countDocuments(),
        MissionModel.countDocuments({ isActive: true }),
        AttemptModel.countDocuments(),
      ]);
      return { usersCount, missionsCount, attemptsCount };
    }
    const db = readLocalDb();
    return {
      usersCount: db.users.length,
      missionsCount: db.missions.filter((m) => m.isActive).length,
      attemptsCount: db.attempts.length,
    };
  },
};
