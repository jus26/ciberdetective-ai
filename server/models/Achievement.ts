import mongoose, { Schema, type Document } from 'mongoose';

export interface IAchievement extends Document {
  code: string;
  title: string;
  description: string;
  category: 'general' | 'phishing' | 'privacy' | 'digital_law' | 'mastery';
  xpBonus: number;
  iconKey: string;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'phishing', 'privacy', 'digital_law', 'mastery'],
      required: true,
    },
    xpBonus: { type: Number, required: true, default: 50 },
    iconKey: { type: String, required: true },
  },
  { timestamps: false }
);

export const AchievementModel =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>('Achievement', AchievementSchema);
