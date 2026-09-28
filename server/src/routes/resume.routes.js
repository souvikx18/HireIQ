import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

// Use optionalAuthenticate — recruiter is logged in via UI but JWT may have expired.
// The controller safely handles req.user being null (audit log uses req.user?.userId).
router.use(optionalAuthenticate);

router.post('/upload', uploadResume.single('resume'), resumeController.uploadAndAnalyze);
router.get('/history', resumeController.getUploadHistory);

export default router;
