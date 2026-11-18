import { Router } from 'express';
import {
  addCommentToDebate,
  createCommentSchema,
  createDebatePost,
  createPostSchema,
  listDebatesByMission,
  toggleVoteDebatePost,
} from '../controllers/debateController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import {
  validateBody,
  validateObjectIdParam,
} from '../middleware/validateMiddleware.ts';

const router = Router();

router.get(
  '/mision/:missionId',
  validateObjectIdParam('missionId'),
  listDebatesByMission
);

router.post(
  '/mision/:missionId',
  protect,
  validateObjectIdParam('missionId'),
  validateBody(createPostSchema),
  createDebatePost
);

router.post(
  '/:postId/comentar',
  protect,
  validateObjectIdParam('postId'),
  validateBody(createCommentSchema),
  addCommentToDebate
);

router.patch(
  '/:postId/votar',
  protect,
  validateObjectIdParam('postId'),
  toggleVoteDebatePost
);

export default router;
