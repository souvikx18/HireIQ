import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }),
});

export const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.userId);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updated = await authService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.userId, req.body);
      return sendSuccess(res, null, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  },
};
