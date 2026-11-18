import mongoose, { Schema, type Document } from 'mongoose';

export type MissionCategory = 'phishing' | 'privacy' | 'digital_law';
export type MissionDifficulty = 'inicial' | 'intermedio' | 'avanzado';
export type ArtifactType = 'email' | 'privacy_notice' | 'incident_log' | 'legal_dossier';

export interface IMissionOption {
  id: string;
  label: string;
  text: string;
}

export interface IArtifactData {
  sender?: string;
  recipient?: string;
  subject?: string;
  headers?: string[];
  body: string;
  suspiciousIndicators?: string[];
  metadata?: Record<string, string>;
}

export interface IMission extends Document {
  slug: string;
  title: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  basePoints: number;
  brief: string;
  artifactType: ArtifactType;
  artifactData: IArtifactData;
  question: string;
  options: IMissionOption[];
  correctOptionId: string;
  referenceSolution: string;
  legalContext: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MissionOptionSchema = new Schema<IMissionOption>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const ArtifactDataSchema = new Schema<IArtifactData>(
  {
    sender: { type: String },
    recipient: { type: String },
    subject: { type: String },
    headers: { type: [String], default: [] },
    body: { type: String, required: true },
    suspiciousIndicators: { type: [String], default: [] },
    metadata: { type: Map, of: String },
  },
  { _id: false }
);

const MissionSchema = new Schema<IMission>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['phishing', 'privacy', 'digital_law'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['inicial', 'intermedio', 'avanzado'],
      required: true,
    },
    xpReward: { type: Number, required: true, min: 10 },
    basePoints: { type: Number, required: true, min: 10 },
    brief: { type: String, required: true },
    artifactType: {
      type: String,
      enum: ['email', 'privacy_notice', 'incident_log', 'legal_dossier'],
      required: true,
    },
    artifactData: { type: ArtifactDataSchema, required: true },
    question: { type: String, required: true },
    options: { type: [MissionOptionSchema], required: true },
    correctOptionId: { type: String, required: true },
    referenceSolution: { type: String, required: true },
    legalContext: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

MissionSchema.index({ category: 1, isActive: 1 });

export const MissionModel =
  mongoose.models.Mission || mongoose.model<IMission>('Mission', MissionSchema);
