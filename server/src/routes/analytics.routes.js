import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getDashboardOverview);
router.get('/skill-gaps', analyticsController.getSkillGaps);

export default router;
