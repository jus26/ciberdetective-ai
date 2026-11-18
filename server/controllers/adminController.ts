import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { dataStore } from '../services/dataStore.ts';

const optionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1).max(4),
  text: z.string().trim().min(5, 'El texto de cada opción debe tener al menos 5 caracteres.'),
});

const missionPayloadSchema = z.object({
  title: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres.').max(160),
  category: z.enum(['phishing', 'privacy', 'digital_law']),
  difficulty: z.enum(['inicial', 'intermedio', 'avanzado']),
  xpReward: z.coerce.number().int().min(20).max(1000),
  basePoints: z.coerce.number().int().min(20).max(1500),
  brief: z.string().trim().min(20, 'El enunciado debe tener al menos 20 caracteres.'),
  artifactType: z.enum(['email', 'privacy_notice', 'incident_log', 'legal_dossier']),
  artifactData: z.object({
    sender: z.string().trim().optional(),
    recipient: z.string().trim().optional(),
    subject: z.string().trim().optional(),
    headers: z.array(z.string().trim()).optional(),
    body: z.string().trim().min(10, 'El contenido de evidencia es obligatorio.'),
    suspiciousIndicators: z.array(z.string().trim()).optional(),
  }),
  question: z.string().trim().min(10, 'La pregunta es obligatoria.'),
  options: z.array(optionSchema).min(2).max(5),
  correctOptionId: z.string().trim().min(1),
  referenceSolution: z
    .string()
    .trim()
    .min(20, 'La solución de referencia debe ser detallada.'),
  legalContext: z
    .string()
    .trim()
    .min(20, 'El contexto jurídico verificado es obligatorio.'),
  isActive: z.boolean().optional().default(true),
});

function buildSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) +
    '-' +
    Date.now().toString().slice(-4)
  );
}

export async function adminListMissions(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const [missions, stats] = await Promise.all([
    dataStore.listMissions(true),
    dataStore.getPlatformStats(),
  ]);
  res.json({ missions, stats });
}

export async function adminCreateMission(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const parsed = missionPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Datos de misión inválidos.',
    });
    return;
  }

  const data = parsed.data;
  const hasMatchingCorrectOption = data.options.some(
    (o) => o.id === data.correctOptionId
  );
  if (!hasMatchingCorrectOption) {
    res.status(400).json({
      error: 'El identificador de opción correcta debe coincidir con una de las opciones.',
    });
    return;
  }

  const created = await dataStore.createMission({
    slug: buildSlug(data.title),
    title: data.title,
    category: data.category,
    difficulty: data.difficulty,
    xpReward: data.xpReward,
    basePoints: data.basePoints,
    brief: data.brief,
    artifactType: data.artifactType,
    artifactData: {
      sender: data.artifactData.sender || undefined,
      recipient: data.artifactData.recipient || undefined,
      subject: data.artifactData.subject || undefined,
      headers: data.artifactData.headers || [],
      body: data.artifactData.body,
      suspiciousIndicators: data.artifactData.suspiciousIndicators || [],
    },
    question: data.question,
    options: data.options,
    correctOptionId: data.correctOptionId,
    referenceSolution: data.referenceSolution,
    legalContext: data.legalContext,
    isActive: data.isActive,
    createdBy: req.currentUser?.codename || 'admin',
  });

  res.status(201).json({ mission: created });
}

export async function adminUpdateMission(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = String(req.params.id || '');
  const existing = await dataStore.findMissionById(id);
  if (!existing) {
    res.status(404).json({ error: 'Misión no encontrada.' });
    return;
  }

  const parsed = missionPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Datos de actualización inválidos.',
    });
    return;
  }

  const data = parsed.data;
  const hasMatchingCorrectOption = data.options.some(
    (o) => o.id === data.correctOptionId
  );
  if (!hasMatchingCorrectOption) {
    res.status(400).json({
      error: 'La opción correcta debe coincidir con una de las opciones.',
    });
    return;
  }

  const updated = await dataStore.updateMission(id, {
    title: data.title,
    category: data.category,
    difficulty: data.difficulty,
    xpReward: data.xpReward,
    basePoints: data.basePoints,
    brief: data.brief,
    artifactType: data.artifactType,
    artifactData: {
      sender: data.artifactData.sender || undefined,
      recipient: data.artifactData.recipient || undefined,
      subject: data.artifactData.subject || undefined,
      headers: data.artifactData.headers || [],
      body: data.artifactData.body,
      suspiciousIndicators: data.artifactData.suspiciousIndicators || [],
    },
    question: data.question,
    options: data.options,
    correctOptionId: data.correctOptionId,
    referenceSolution: data.referenceSolution,
    legalContext: data.legalContext,
    isActive: data.isActive,
  });

  res.json({ mission: updated });
}

export async function adminToggleMission(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = String(req.params.id || '');
  const existing = await dataStore.findMissionById(id);
  if (!existing) {
    res.status(404).json({ error: 'Misión no encontrada.' });
    return;
  }

  const updated = await dataStore.updateMission(id, {
    isActive: !existing.isActive,
  });
  res.json({ mission: updated });
}

export async function adminDeleteMission(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = String(req.params.id || '');
  const deleted = await dataStore.deleteMission(id);
  if (!deleted) {
    res.status(404).json({ error: 'Misión no encontrada.' });
    return;
  }
  res.json({ deleted: true });
}
