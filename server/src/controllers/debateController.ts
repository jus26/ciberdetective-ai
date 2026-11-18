import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/authMiddleware.ts';
import { DebatePost } from '../models/DebatePost.ts';
import { Mission } from '../models/Mission.ts';

export const createPostSchema = z.object({
  argumento: z
    .string()
    .trim()
    .min(10, 'El argumento debe tener al menos 10 caracteres.')
    .max(2500, 'El argumento no puede superar los 2500 caracteres.'),
});

export const createCommentSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(2, 'El comentario debe tener al menos 2 caracteres.')
    .max(1000, 'El comentario no puede superar los 1000 caracteres.'),
});

export async function listDebatesByMission(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const posts = await DebatePost.find({ missionId: req.params.missionId }).sort({
      createdAt: -1,
    });

    res.json({
      ok: true,
      publicaciones: posts.map((p) => ({
        id: p._id,
        missionId: p.missionId,
        userId: p.userId,
        autorNombre: p.autorNombre,
        argumento: p.argumento,
        totalVotos: p.votos.length,
        votos: p.votos,
        comentarios: p.comentarios,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error('[List Debates]', err);
    res.status(500).json({ ok: false, error: 'Error al obtener el foro de debate.' });
  }
}

export async function createDebatePost(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const mission = await Mission.findById(req.params.missionId);
    if (!mission) {
      res.status(404).json({ ok: false, error: 'Misión no encontrada.' });
      return;
    }

    const { argumento } = req.body as z.infer<typeof createPostSchema>;
    const post = await DebatePost.create({
      missionId: mission._id,
      userId: req.user._id,
      autorNombre: req.user.nombre,
      argumento,
    });

    res.status(201).json({ ok: true, publicacion: post });
  } catch (err) {
    console.error('[Create Debate Post]', err);
    res.status(500).json({ ok: false, error: 'Error al publicar en el debate.' });
  }
}

export async function addCommentToDebate(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const post = await DebatePost.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ ok: false, error: 'Publicación no encontrada.' });
      return;
    }

    const { texto } = req.body as z.infer<typeof createCommentSchema>;
    post.comentarios.push({
      userId: req.user._id as any,
      autor: req.user.nombre,
      texto,
      fecha: new Date(),
    });
    await post.save();

    res.status(201).json({ ok: true, publicacion: post });
  } catch (err) {
    console.error('[Add Debate Comment]', err);
    res.status(500).json({ ok: false, error: 'Error al añadir el comentario.' });
  }
}

export async function toggleVoteDebatePost(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const post = await DebatePost.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ ok: false, error: 'Publicación no encontrada.' });
      return;
    }

    const userIdStr = String(req.user._id);
    const alreadyVoted = post.votos.some((v: any) => String(v) === userIdStr);

    if (alreadyVoted) {
      post.votos = post.votos.filter((v: any) => String(v) !== userIdStr);
    } else {
      post.votos.push(req.user._id as any);
    }

    await post.save();

    res.json({
      ok: true,
      votado: !alreadyVoted,
      totalVotos: post.votos.length,
    });
  } catch (err) {
    console.error('[Toggle Vote]', err);
    res.status(500).json({ ok: false, error: 'Error al registrar el voto.' });
  }
}
