import mongoose, { Schema, type Document } from 'mongoose';

export type UserRole = 'player' | 'admin';

export interface ICategoryStats {
  phishingSolved: number;
  privacySolved: number;
  digitalLawSolved: number;
}

export interface IUser extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const CategoryStatsSchema = new Schema<ICategoryStats>(
  {
    phishingSolved: { type: Number, default: 0 },
    privacySolved: { type: Number, default: 0 },
    digitalLawSolved: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    codename: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['player', 'admin'],
      default: 'player',
    },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    totalScore: { type: Number, default: 0, min: 0 },
    missionsCompleted: { type: Number, default: 0, min: 0 },
    missionsCorrect: { type: Number, default: 0, min: 0 },
    streak: { type: Number, default: 0, min: 0 },
    bestStreak: { type: Number, default: 0, min: 0 },
    unlockedAchievements: { type: [String], default: [] },
    categoryStats: { type: CategoryStatsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

UserSchema.index({ totalScore: -1, xp: -1 });

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
