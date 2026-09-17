import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, ROLES } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Allow Admin and HR Manager to access health & audit
router.get(
  '/health',
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  adminController.getSystemHealth
);

router.get(
  '/audit-logs',
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  adminController.getAuditLogs
);

router.get(
  '/users',
  requireRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
  adminController.listUsers
);

router.patch(
  '/users/:id/role',
  requireRole([ROLES.ADMIN]),
  adminController.updateUserRole
);

export default router;
