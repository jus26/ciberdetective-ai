import mongoose, { Schema, type Document } from 'mongoose';

export interface IAiAnalysis {
  evaluationSummary: string;
  correctAnswerReason: string;
  cybersecurityRisks: string[];
  legalExplanation: string;
  preventiveRecommendations: string[];
  justificationFeedback?: string;
}

export interface IAttempt extends Document {
  userId: string;
  missionId: string;
  missionTitle: string;
  missionCategory: 'phishing' | 'privacy' | 'digital_law';
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  userJustification: string;
  isCorrect: boolean;
  pointsEarned: number;
  xpEarned: number;
  aiAnalysis: IAiAnalysis;
  createdAt: Date;
}

const AiAnalysisSchema = new Schema<IAiAnalysis>(
  {
    evaluationSummary: { type: String, required: true },
    correctAnswerReason: { type: String, required: true },
    cybersecurityRisks: { type: [String], required: true },
    legalExplanation: { type: String, required: true },
    preventiveRecommendations: { type: [String], required: true },
    justificationFeedback: { type: String },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    userId: { type: String, required: true, index: true },
    missionId: { type: String, required: true, index: true },
    missionTitle: { type: String, required: true },
    missionCategory: {
      type: String,
      enum: ['phishing', 'privacy', 'digital_law'],
      required: true,
    },
    selectedOptionId: { type: String, required: true },
    selectedOptionText: { type: String, required: true },
    correctOptionId: { type: String, required: true },
    userJustification: { type: String, default: '' },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, required: true, min: 0 },
    xpEarned: { type: Number, required: true, min: 0 },
    aiAnalysis: { type: AiAnalysisSchema, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AttemptSchema.index({ userId: 1, createdAt: -1 });

export const AttemptModel =
  mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
