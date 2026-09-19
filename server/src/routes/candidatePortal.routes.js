import { Router } from 'express';
import { candidatePortalController } from '../controllers/candidatePortal.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

// Resume self-audit: optional authentication
router.post('/audit', optionalAuthenticate, uploadResume.single('resume'), candidatePortalController.auditResume);

// Public / Candidate jobs listing with match score
router.get('/jobs', optionalAuthenticate, candidatePortalController.getJobs);

// Protected Candidate Portal routes
router.get('/profile', authenticate, candidatePortalController.getProfile);
router.post('/apply/:jobId', authenticate, candidatePortalController.applyForJob);
router.get('/applications', authenticate, candidatePortalController.getMyApplications);

export default router;
