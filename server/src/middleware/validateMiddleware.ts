import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import type { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        ok: false,
        error: parsed.error.issues[0]?.message || 'Datos de entrada inválidos.',
        detalles: parsed.error.issues.map((i) => ({
          campo: i.path.join('.'),
          mensaje: i.message,
        })),
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateObjectIdParam(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = String(req.params[paramName] || '');
    if (!mongoose.Types.ObjectId.isValid(value)) {
      res.status(400).json({
        ok: false,
        error: `Identificador inválido en el parámetro '${paramName}'.`,
      });
      return;
    }
    next();
  };
}
