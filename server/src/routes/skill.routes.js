import { Router } from 'express';
import { skillController } from '../controllers/skill.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, ROLES } from '../middleware/rbac.js';

const router = Router();

// Allow authenticated users to view skills
router.get('/', authenticate, skillController.listSkills);

// Admin & HR Manager manage company hiring benchmarks
router.post(
  '/',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  skillController.createSkill
);

router.put(
  '/:id',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  skillController.updateSkill
);

router.delete(
  '/:id',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  skillController.deleteSkill
);

router.post(
  '/seed',
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  skillController.seedDefaultSkills
);

export default router;
