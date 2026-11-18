import mongoose, { Schema, type Document } from 'mongoose';

export interface IScore extends Document {
  userId: string;
  codename: string;
  level: number;
  xp: number;
  totalPoints: number;
  missionsSolved: number;
  accuracy: number;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    userId: { type: String, required: true, unique: true },
    codename: { type: String, required: true },
    level: { type: Number, required: true, default: 1 },
    xp: { type: Number, required: true, default: 0 },
    totalPoints: { type: Number, required: true, default: 0 },
    missionsSolved: { type: Number, required: true, default: 0 },
    accuracy: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

ScoreSchema.index({ totalPoints: -1, xp: -1 });

export const ScoreModel =
  mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);
