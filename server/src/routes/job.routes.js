import { Router } from 'express';
import { jobController, createJobSchema } from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, ROLES } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Viewing jobs is open to authenticated users
router.get('/', authenticate, jobController.listJobs);
router.get('/:id', authenticate, jobController.getJob);
router.get('/:id/candidates', authenticate, jobController.getJobCandidates);

// Creating, updating and deleting roles requires ADMIN or HR_MANAGER role
router.post(
  '/',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  validate(createJobSchema),
  jobController.createJob
);

router.put(
  '/:id',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  jobController.updateJob
);

router.delete(
  '/:id',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  jobController.deleteJob
);

export default router;
