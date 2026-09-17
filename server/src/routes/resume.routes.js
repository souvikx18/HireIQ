import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadResume.single('resume'), resumeController.uploadAndAnalyze);
router.get('/history', resumeController.getUploadHistory);

export default router;
