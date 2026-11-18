import mongoose, { Schema, type Document } from 'mongoose';

export type MissionCategoria =
  | 'phishing'
  | 'privacidad'
  | 'derecho_digital'
  | 'forense';

export type MissionDificultad = 'facil' | 'medio' | 'experto';

export interface ISimulatedEmail {
  remitente: string;
  destinatario: string;
  asunto: string;
  cabeceras: string[];
  cuerpo: string;
}

export interface IEvidencias {
  correosSimulados?: ISimulatedEmail[];
  logs?: string[];
  metadatos?: Record<string, string>;
  extractosLegales?: string[];
}

export interface IOpcionTest {
  id: string;
  etiqueta: string;
  texto: string;
  esCorrecta: boolean;
}

export interface IMission extends Document {
  titulo: string;
  descripcion: string;
  categoria: MissionCategoria;
  dificultad: MissionDificultad;
  tiempoLimiteSegundos: number;
  xpRecompensa: number;
  evidencias: IEvidencias;
  preguntaPrincipal: string;
  opcionesTest: IOpcionTest[];
  solucionReferencia: string;
  marcoLegalReal: string;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SimulatedEmailSchema = new Schema<ISimulatedEmail>(
  {
    remitente: { type: String, required: true },
    destinatario: { type: String, required: true },
    asunto: { type: String, required: true },
    cabeceras: { type: [String], default: [] },
    cuerpo: { type: String, required: true },
  },
  { _id: false }
);

const EvidenciasSchema = new Schema<IEvidencias>(
  {
    correosSimulados: { type: [SimulatedEmailSchema], default: [] },
    logs: { type: [String], default: [] },
    metadatos: { type: Map, of: String, default: {} },
    extractosLegales: { type: [String], default: [] },
  },
  { _id: false }
);

const OpcionTestSchema = new Schema<IOpcionTest>(
  {
    id: { type: String, required: true },
    etiqueta: { type: String, required: true },
    texto: { type: String, required: true },
    esCorrecta: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const MissionSchema = new Schema<IMission>(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      enum: ['phishing', 'privacidad', 'derecho_digital', 'forense'],
      required: true,
    },
    dificultad: {
      type: String,
      enum: ['facil', 'medio', 'experto'],
      required: true,
    },
    tiempoLimiteSegundos: {
      type: Number,
      required: true,
      min: 60,
      max: 3600,
    },
    xpRecompensa: {
      type: Number,
      required: true,
      min: 20,
      max: 2000,
    },
    evidencias: {
      type: EvidenciasSchema,
      required: true,
    },
    preguntaPrincipal: {
      type: String,
      required: true,
      trim: true,
    },
    opcionesTest: {
      type: [OpcionTestSchema],
      required: true,
      validate: {
        validator: (opts: IOpcionTest[]) =>
          Array.isArray(opts) && opts.length >= 2,
        message: 'Cada misión debe incluir al menos 2 opciones de test',
      },
    },
    solucionReferencia: {
      type: String,
      required: true,
    },
    marcoLegalReal: {
      type: String,
      required: true,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

MissionSchema.index({ categoria: 1, dificultad: 1, activa: 1 });
MissionSchema.index({ createdAt: -1 });

export const Mission =
  mongoose.models.Mission || mongoose.model<IMission>('Mission', MissionSchema);
