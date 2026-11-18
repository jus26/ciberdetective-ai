import mongoose, { Schema, type Document } from 'mongoose';

export type BadgeCondicionTipo =
  | 'misiones_aprobadas'
  | 'categoria_phishing'
  | 'categoria_privacidad'
  | 'categoria_derecho_digital'
  | 'categoria_forense'
  | 'racha_dias'
  | 'nivel_alcanzado'
  | 'puntuacion_minima';

export interface IBadge extends Document {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  condicionTipo: BadgeCondicionTipo;
  condicionValor: number;
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    icono: {
      type: String,
      required: true,
      trim: true,
    },
    condicionTipo: {
      type: String,
      enum: [
        'misiones_aprobadas',
        'categoria_phishing',
        'categoria_privacidad',
        'categoria_derecho_digital',
        'categoria_forense',
        'racha_dias',
        'nivel_alcanzado',
        'puntuacion_minima',
      ],
      required: true,
    },
    condicionValor: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

BadgeSchema.index({ condicionTipo: 1 });

export const Badge =
  mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);
