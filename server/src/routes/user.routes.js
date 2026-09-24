import { Router } from 'express';
import { userController, changePasswordSchema } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.get('/notifications', userController.getNotifications);
router.put('/profile', userController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), userController.changePassword);

export default router;
