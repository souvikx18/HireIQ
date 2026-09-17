import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// Chatbot can be accessed with or without full authentication
router.post('/chat', optionalAuthenticate, aiController.chat);

export default router;
