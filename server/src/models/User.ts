import bcrypt from 'bcryptjs';
import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  nivel: number;
  xp: number;
  rachaDias: number;
  ultimaConexion: Date;
  insignias: Types.ObjectId[];
  rol: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [60, 'El nombre no puede superar los 60 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false,
    },
    nivel: {
      type: Number,
      default: 1,
      min: 1,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    rachaDias: {
      type: Number,
      default: 1,
      min: 0,
    },
    ultimaConexion: {
      type: Date,
      default: Date.now,
    },
    insignias: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    rol: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ xp: -1, nivel: -1 });
UserSchema.index({ rol: 1 });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
