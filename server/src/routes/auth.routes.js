import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController, registerSchema, loginSchema } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Strict rate limiting on auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per 15 minutes per IP
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
