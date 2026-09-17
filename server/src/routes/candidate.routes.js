import { Router } from 'express';
import {
  candidateController,
  updateCandidateStatusSchema,
  addReviewSchema,
} from '../controllers/candidate.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, ROLES } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', candidateController.listCandidates);
router.post('/compare', candidateController.compareCandidates);
router.get('/compare', candidateController.compareCandidates);
router.get('/:id', candidateController.getCandidate);

router.patch(
  '/:id/status',
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.RECRUITER]),
  validate(updateCandidateStatusSchema),
  candidateController.updateStatus
);

router.delete(
  '/:id',
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  candidateController.deleteCandidate
);

router.post(
  '/:id/reviews',
  validate(addReviewSchema),
  candidateController.addReview
);

export default router;
