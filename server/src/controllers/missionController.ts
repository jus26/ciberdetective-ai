import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/authMiddleware.ts';
import { Attempt } from '../models/Attempt.ts';
import {
  Mission,
  type IMission,
  type IOpcionTest,
} from '../models/Mission.ts';
import {
  calculateLevelFromXp,
  calculateNextSpacedRepetitionDate,
  unlockEligibleBadges,
} from '../services/gamificationService.ts';
import { evaluateMissionWithGemini } from '../services/geminiService.ts';

export const answerMissionSchema = z.object({
  opcionId: z.string().trim().min(1, 'Debes seleccionar una opción de test.'),
  justificacion: z
    .string()
    .trim()
    .max(1500, 'La justificación no puede superar los 1500 caracteres.')
    .optional()
    .default(''),
  tiempoEmpleadoSegundos: z.coerce.number().int().min(0).max(7200).optional().default(0),
});

export const missionCrudSchema = z.object({
  titulo: z.string().trim().min(5).max(180),
  descripcion: z.string().trim().min(20),
  categoria: z.enum(['phishing', 'privacidad', 'derecho_digital', 'forense']),
  dificultad: z.enum(['facil', 'medio', 'experto']),
  tiempoLimiteSegundos: z.coerce.number().int().min(60).max(3600),
  xpRecompensa: z.coerce.number().int().min(20).max(2000),
  evidencias: z.object({
    correosSimulados: z
      .array(
        z.object({
          remitente: z.string().trim().min(1),
          destinatario: z.string().trim().min(1),
          asunto: z.string().trim().min(1),
          cabeceras: z.array(z.string()).optional().default([]),
          cuerpo: z.string().trim().min(1),
        })
      )
      .optional()
      .default([]),
    logs: z.array(z.string()).optional().default([]),
    metadatos: z.record(z.string(), z.string()).optional().default({}),
    extractosLegales: z.array(z.string()).optional().default([]),
  }),
  preguntaPrincipal: z.string().trim().min(10),
  opcionesTest: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        etiqueta: z.string().trim().min(1).max(5),
        texto: z.string().trim().min(5),
        esCorrecta: z.boolean(),
      })
    )
    .min(2),
  solucionReferencia: z.string().trim().min(20),
  marcoLegalReal: z.string().trim().min(20),
  activa: z.boolean().optional().default(true),
});

function sanitizeMissionForPlayer(mission: IMission, resuelta = false) {
  const metadatosObj =
    mission.evidencias?.metadatos instanceof Map
      ? Object.fromEntries(mission.evidencias.metadatos.entries())
      : mission.evidencias?.metadatos || {};

  return {
    id: mission._id,
    titulo: mission.titulo,
    descripcion: mission.descripcion,
    categoria: mission.categoria,
    dificultad: mission.dificultad,
    tiempoLimiteSegundos: mission.tiempoLimiteSegundos,
    xpRecompensa: mission.xpRecompensa,
    evidencias: {
      correosSimulados: mission.evidencias?.correosSimulados || [],
      logs: mission.evidencias?.logs || [],
      metadatos: metadatosObj,
      extractosLegales: mission.evidencias?.extractosLegales || [],
    },
    preguntaPrincipal: mission.preguntaPrincipal,
    opcionesTest: mission.opcionesTest.map((o) => ({
      id: o.id,
      etiqueta: o.etiqueta,
      texto: o.texto,
    })),
    resuelta,
  };
}

export async function listMissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filter: Record<string, unknown> = { activa: true };
    if (req.query.categoria) {
      filter.categoria = String(req.query.categoria);
    }
    if (req.query.dificultad) {
      filter.dificultad = String(req.query.dificultad);
    }

    const missions = await Mission.find(filter).sort({ createdAt: 1 });
    let solvedSet = new Set<string>();

    if (req.user) {
      const passed = await Attempt.find({
        userId: req.user._id,
        aprobado: true,
      }).select('missionId');
      solvedSet = new Set(passed.map((p) => String(p.missionId)));
    }

    res.json({
      ok: true,
      misiones: missions.map((m) =>
        sanitizeMissionForPlayer(m, solvedSet.has(String(m._id)))
      ),
    });
  } catch (err) {
    console.error('[List Missions]', err);
    res.status(500).json({ ok: false, error: 'Error al listar las misiones.' });
  }
}

export async function getMissionDetail(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const mission = await Mission.findOne({ _id: req.params.id, activa: true });
    if (!mission) {
      res.status(404).json({ ok: false, error: 'Misión no encontrada.' });
      return;
    }

    let resuelta = false;
    if (req.user) {
      const existing = await Attempt.exists({
        userId: req.user._id,
        missionId: mission._id,
        aprobado: true,
      });
      resuelta = Boolean(existing);
    }

    res.json({
      ok: true,
      mision: sanitizeMissionForPlayer(mission, resuelta),
    });
  } catch (err) {
    console.error('[Mission Detail]', err);
    res.status(500).json({ ok: false, error: 'Error al cargar la misión.' });
  }
}

export async function answerMission(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Autenticación requerida.' });
      return;
    }

    const mission = await Mission.findOne({ _id: req.params.id, activa: true });
    if (!mission) {
      res.status(404).json({ ok: false, error: 'Misión no encontrada.' });
      return;
    }

    const { opcionId, justificacion, tiempoEmpleadoSegundos } =
      req.body as z.infer<typeof answerMissionSchema>;

    const chosenOption = mission.opcionesTest.find(
      (o: IOpcionTest) => o.id === opcionId
    );
    if (!chosenOption) {
      res.status(400).json({
        ok: false,
        error: 'La opción seleccionada no corresponde a esta misión.',
      });
      return;
    }

    let feedbackIA;
    try {
      feedbackIA = await evaluateMissionWithGemini({
        mission,
        opcionSeleccionadaId: opcionId,
        justificacionUsuario: justificacion,
      });
    } catch (aiError: any) {
      console.error('[Gemini Evaluation Error]', aiError);
      res.status(502).json({
        ok: false,
        error:
          aiError?.message ||
          'No se pudo completar la evaluación con Gemini en este momento.',
      });
      return;
    }

    const yaAprobadaAntes = Boolean(
      await Attempt.exists({
        userId: req.user._id,
        missionId: mission._id,
        aprobado: true,
      })
    );

    const fechaProximaAlerta = calculateNextSpacedRepetitionDate(
      feedbackIA.aprobado
    );

    const attempt = await Attempt.create({
      userId: req.user._id,
      missionId: mission._id,
      respuestaUsuario: {
        opcionId,
        justificacion,
        tiempoEmpleadoSegundos,
      },
      puntuacionObtenida: feedbackIA.puntuacion,
      feedbackIA,
      aprobado: feedbackIA.aprobado,
      fechaProximaAlerta,
    });

    // Clear previous spaced-repetition alerts for this mission if user now passed
    if (feedbackIA.aprobado) {
      await Attempt.updateMany(
        {
          userId: req.user._id,
          missionId: mission._id,
          aprobado: false,
          fechaProximaAlerta: { $ne: null },
        },
        { $set: { fechaProximaAlerta: null } }
      );
    }

    let xpGanada = 0;
    if (feedbackIA.aprobado) {
      xpGanada = yaAprobadaAntes ? 15 : mission.xpRecompensa;
    } else {
      xpGanada = 10;
    }

    req.user.xp += xpGanada;
    req.user.nivel = calculateLevelFromXp(req.user.xp);
    await req.user.save();

    const nuevasInsignias = await unlockEligibleBadges(req.user);

    const correctOption = mission.opcionesTest.find(
      (o: IOpcionTest) => o.esCorrecta
    );

    res.json({
      ok: true,
      intento: attempt,
      xpGanada,
      nivelActual: req.user.nivel,
      xpTotal: req.user.xp,
      nuevasInsignias,
      opcionCorrectaId: correctOption?.id,
      solucionReferencia: mission.solucionReferencia,
      marcoLegalReal: mission.marcoLegalReal,
    });
  } catch (err) {
    console.error('[Answer Mission]', err);
    res.status(500).json({ ok: false, error: 'Error al registrar la respuesta.' });
  }
}

export async function createMission(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const payload = req.body as z.infer<typeof missionCrudSchema>;
    const hasCorrect = payload.opcionesTest.some((o) => o.esCorrecta);
    if (!hasCorrect) {
      res.status(400).json({
        ok: false,
        error: 'Al menos una opción del test debe estar marcada como correcta.',
      });
      return;
    }

    const mission = await Mission.create(payload);
    res.status(201).json({ ok: true, mision: mission });
  } catch (err) {
    console.error('[Create Mission]', err);
    res.status(500).json({ ok: false, error: 'Error al crear la misión.' });
  }
}

export async function updateMission(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const payload = req.body as z.infer<typeof missionCrudSchema>;
    const hasCorrect = payload.opcionesTest.some((o) => o.esCorrecta);
    if (!hasCorrect) {
      res.status(400).json({
        ok: false,
        error: 'Al menos una opción del test debe estar marcada como correcta.',
      });
      return;
    }

    const updated = await Mission.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      res.status(404).json({ ok: false, error: 'Misión no encontrada.' });
      return;
    }

    res.json({ ok: true, mision: updated });
  } catch (err) {
    console.error('[Update Mission]', err);
    res.status(500).json({ ok: false, error: 'Error al actualizar la misión.' });
  }
}

export async function adminListAllMissions(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const missions = await Mission.find().sort({ createdAt: -1 });
    const formatted = missions.map((m) => {
      const metadatosObj =
        m.evidencias?.metadatos instanceof Map
          ? Object.fromEntries(m.evidencias.metadatos.entries())
          : m.evidencias?.metadatos || {};

      return {
        id: m._id,
        titulo: m.titulo,
        descripcion: m.descripcion,
        categoria: m.categoria,
        dificultad: m.dificultad,
        tiempoLimiteSegundos: m.tiempoLimiteSegundos,
        xpRecompensa: m.xpRecompensa,
        evidencias: {
          correosSimulados: m.evidencias?.correosSimulados || [],
          logs: m.evidencias?.logs || [],
          metadatos: metadatosObj,
          extractosLegales: m.evidencias?.extractosLegales || [],
        },
        preguntaPrincipal: m.preguntaPrincipal,
        opcionesTest: m.opcionesTest,
        solucionReferencia: m.solucionReferencia,
        marcoLegalReal: m.marcoLegalReal,
        activa: m.activa,
      };
    });

    res.json({ ok: true, misiones: formatted });
  } catch (err) {
    console.error('[Admin List Missions]', err);
    res
      .status(500)
      .json({ ok: false, error: 'Error al listar misiones de administración.' });
  }
}

export async function deleteMission(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const deleted = await Mission.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ ok: false, error: 'Misión no encontrada.' });
      return;
    }
    res.json({ ok: true, eliminada: true });
  } catch (err) {
    console.error('[Delete Mission]', err);
    res.status(500).json({ ok: false, error: 'Error al eliminar la misión.' });
  }
}
