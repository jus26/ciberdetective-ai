import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController.ts';
import {
  getMissionById,
  listMissions,
  submitMissionAnswer,
} from '../controllers/missionController.ts';
import {
  getAchievementsCatalog,
  getLeaderboard,
  getPlatformSummary,
  getPlayerHistory,
  getPlayerProfile,
} from '../controllers/userController.ts';
import {
  adminCreateMission,
  adminDeleteMission,
  adminListMissions,
  adminToggleMission,
  adminUpdateMission,
} from '../controllers/adminController.ts';
import {
  authenticate,
  optionalAuthenticate,
  requireAdmin,
} from '../middleware/auth.ts';
import {
  aiEvaluationLimiter,
  authRateLimiter,
} from '../middleware/rateLimit.ts';
import { isMongoConnected } from '../config/database.ts';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    database: isMongoConnected() ? 'mongodb_atlas' : 'local_store',
    timestamp: new Date().toISOString(),
  });
});

// Public platform summary & catalog
router.get('/summary', getPlatformSummary);
router.get('/leaderboard', getLeaderboard);
router.get('/achievements', getAchievementsCatalog);

// Auth routes (rate-limited)
router.post('/auth/register', authRateLimiter, register);
router.post('/auth/login', authRateLimiter, login);
router.get('/auth/me', authenticate, getMe);

// Missions
router.get('/missions', optionalAuthenticate, listMissions);
router.get('/missions/:id', optionalAuthenticate, getMissionById);
router.post(
  '/missions/:id/submit',
  authenticate,
  aiEvaluationLimiter,
  submitMissionAnswer
);

// Private player routes
router.get('/profile', authenticate, getPlayerProfile);
router.get('/history', authenticate, getPlayerHistory);

// Private admin routes
router.get('/admin/missions', authenticate, requireAdmin, adminListMissions);
router.post('/admin/missions', authenticate, requireAdmin, adminCreateMission);
router.put('/admin/missions/:id', authenticate, requireAdmin, adminUpdateMission);
router.patch(
  '/admin/missions/:id/toggle',
  authenticate,
  requireAdmin,
  adminToggleMission
);
router.delete(
  '/admin/missions/:id',
  authenticate,
  requireAdmin,
  adminDeleteMission
);

export default router;
