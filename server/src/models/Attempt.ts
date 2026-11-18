import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IFeedbackIA {
  aprobado: boolean;
  puntuacion: number;
  explicacionTecnica: string;
  riesgosCiberseguridad: string[];
  marcoJuridicoSencillo: string;
  recomendacionesPreventivas: string[];
  preguntaDebate: string;
}

export interface IRespuestaUsuario {
  opcionId: string;
  justificacion: string;
  tiempoEmpleadoSegundos: number;
}

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  missionId: Types.ObjectId;
  respuestaUsuario: IRespuestaUsuario;
  puntuacionObtenida: number;
  feedbackIA: IFeedbackIA;
  aprobado: boolean;
  fechaProximaAlerta: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RespuestaUsuarioSchema = new Schema<IRespuestaUsuario>(
  {
    opcionId: { type: String, required: true },
    justificacion: { type: String, default: '', maxlength: 1500 },
    tiempoEmpleadoSegundos: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const FeedbackIASchema = new Schema<IFeedbackIA>(
  {
    aprobado: { type: Boolean, required: true },
    puntuacion: { type: Number, required: true, min: 0, max: 100 },
    explicacionTecnica: { type: String, required: true },
    riesgosCiberseguridad: { type: [String], required: true },
    marcoJuridicoSencillo: { type: String, required: true },
    recomendacionesPreventivas: { type: [String], required: true },
    preguntaDebate: { type: String, required: true },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    missionId: {
      type: Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
    },
    respuestaUsuario: {
      type: RespuestaUsuarioSchema,
      required: true,
    },
    puntuacionObtenida: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    feedbackIA: {
      type: FeedbackIASchema,
      required: true,
    },
    aprobado: {
      type: Boolean,
      required: true,
    },
    fechaProximaAlerta: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

AttemptSchema.index({ userId: 1, createdAt: -1 });
AttemptSchema.index({ userId: 1, missionId: 1 });
AttemptSchema.index({ userId: 1, aprobado: 1, fechaProximaAlerta: 1 });

export const Attempt =
  mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
