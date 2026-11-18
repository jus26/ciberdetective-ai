import { Router } from 'express';
import {
  evaluateBadges,
  getBadgesCatalog,
  getGlobalRanking,
  getPendingSpacedRepetitionAlerts,
  getUserAttemptsHistory,
} from '../controllers/gamificationController.ts';
import { optionalAuth, protect } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/ranking', getGlobalRanking);
router.get('/alertas', protect, getPendingSpacedRepetitionAlerts);
router.get('/historial', protect, getUserAttemptsHistory);
router.get('/insignias', optionalAuth, getBadgesCatalog);
router.post('/insignias/evaluar', protect, evaluateBadges);

export default router;
