import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IComentarioDebate {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  autor: string;
  texto: string;
  fecha: Date;
}

export interface IDebatePost extends Document {
  missionId: Types.ObjectId;
  userId: Types.ObjectId;
  autorNombre: string;
  argumento: string;
  votos: Types.ObjectId[];
  comentarios: IComentarioDebate[];
  createdAt: Date;
  updatedAt: Date;
}

const ComentarioSchema = new Schema<IComentarioDebate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    autor: {
      type: String,
      required: true,
      trim: true,
    },
    texto: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const DebatePostSchema = new Schema<IDebatePost>(
  {
    missionId: {
      type: Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    autorNombre: {
      type: String,
      required: true,
      trim: true,
    },
    argumento: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2500,
    },
    votos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comentarios: {
      type: [ComentarioSchema],
      default: [],
    },
  },
  { timestamps: true }
);

DebatePostSchema.index({ missionId: 1, createdAt: -1 });
DebatePostSchema.index({ userId: 1 });

export const DebatePost =
  mongoose.models.DebatePost ||
  mongoose.model<IDebatePost>('DebatePost', DebatePostSchema);
