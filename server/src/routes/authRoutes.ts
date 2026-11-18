import { Router } from 'express';
import {
  getProfile,
  login,
  loginSchema,
  register,
  registerSchema,
} from '../controllers/authController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import { authLimiter } from '../middleware/rateLimitMiddleware.ts';
import { validateBody } from '../middleware/validateMiddleware.ts';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/profile', protect, getProfile);

export default router;
