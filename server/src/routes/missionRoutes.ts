import { Router } from 'express';
import {
  adminListAllMissions,
  answerMission,
  answerMissionSchema,
  createMission,
  deleteMission,
  getMissionDetail,
  listMissions,
  missionCrudSchema,
  updateMission,
} from '../controllers/missionController.ts';
import {
  authorizeRoles,
  optionalAuth,
  protect,
} from '../middleware/authMiddleware.ts';
import { aiLimiter } from '../middleware/rateLimitMiddleware.ts';
import {
  validateBody,
  validateObjectIdParam,
} from '../middleware/validateMiddleware.ts';

const router = Router();

// Rutas CRUD exclusivas de administración (listado completo antes de /:id)
router.get('/admin/all', protect, authorizeRoles('admin'), adminListAllMissions);

// Rutas públicas / jugador
router.get('/', optionalAuth, listMissions);
router.get('/:id', validateObjectIdParam('id'), optionalAuth, getMissionDetail);
router.post(
  '/:id/responder',
  protect,
  aiLimiter,
  validateObjectIdParam('id'),
  validateBody(answerMissionSchema),
  answerMission
);

// Rutas CRUD exclusivas de administración
router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  validateBody(missionCrudSchema),
  createMission
);
router.put(
  '/:id',
  protect,
  authorizeRoles('admin'),
  validateObjectIdParam('id'),
  validateBody(missionCrudSchema),
  updateMission
);
router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  validateObjectIdParam('id'),
  deleteMission
);

export default router;
