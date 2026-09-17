import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { generateAccessToken } from '../utils/jwt.js';
import { config } from '../config/index.js';
import { normalizeRole } from '../middleware/rbac.js';

export const authService = {
  async register({ email, password, firstName, lastName, role = 'ADMIN' }) {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      const err = new Error('A user with this email already exists');
      err.status = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: normalizeRole(role),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  },

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailNotifications: user.emailNotifications,
      hiringUpdates: user.hiringUpdates,
      candidateUpdates: user.candidateUpdates,
      interviewReminders: user.interviewReminders,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = await this.createRefreshToken(user.id);

    return { user: userPayload, accessToken, refreshToken };
  },

  async createRefreshToken(userId) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  },

  async refreshToken(token) {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      const err = new Error('Invalid or expired refresh token');
      err.status = 401;
      throw err;
    }

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revoked: true },
    });

    const newRefreshToken = await this.createRefreshToken(record.userId);
    const accessToken = generateAccessToken(record.user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: record.user.id,
        email: record.user.email,
        firstName: record.user.firstName,
        lastName: record.user.lastName,
        role: record.user.role,
        avatarUrl: record.user.avatarUrl,
      },
    };
  },

  async logout(token) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true },
      });
    }
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      const err = new Error('Current password is incorrect');
      err.status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate old refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    return true;
  },

  async updateProfile(userId, { firstName, lastName, role, avatarUrl, emailNotifications, hiringUpdates, candidateUpdates, interviewReminders }) {
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (role !== undefined) updateData.role = normalizeRole(role);
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (hiringUpdates !== undefined) updateData.hiringUpdates = hiringUpdates;
    if (candidateUpdates !== undefined) updateData.candidateUpdates = candidateUpdates;
    if (interviewReminders !== undefined) updateData.interviewReminders = interviewReminders;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        emailNotifications: true,
        hiringUpdates: true,
        candidateUpdates: true,
        interviewReminders: true,
      },
    });

    return updated;
  },

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        emailNotifications: true,
        hiringUpdates: true,
        candidateUpdates: true,
        interviewReminders: true,
        createdAt: true,
      },
    });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    return user;
  },
};
