import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

function formatTimeAgo(date) {
  if (!date) return 'Just now';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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

  async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const userRole = req.user.role;
      const notifs = [];

      if (userRole === 'CANDIDATE') {
        const candidate = await prisma.candidate.findFirst({
          where: {
            OR: [
              { userId },
              { email: req.user.email },
            ],
          },
          include: {
            applications: {
              include: { jobRole: true },
              orderBy: { updatedAt: 'desc' },
              take: 5,
            },
            resumes: {
              include: { analysis: true },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
        });

        if (candidate?.applications) {
          for (const app of candidate.applications) {
            notifs.push({
              id: `app-${app.id}`,
              title: `Application: ${app.jobRole?.title || 'Open Position'}`,
              desc: `Status: ${app.status?.replace('_', ' ') || 'Applied'} • Match score: ${app.matchScore || 85}%.`,
              time: formatTimeAgo(app.updatedAt),
              timestamp: app.updatedAt,
              read: false,
              icon: 'fa-solid fa-briefcase',
              color: '#2563eb',
              bg: '#eff6ff',
              link: '/candidate/applications',
            });
          }
        }

        if (candidate?.resumes) {
          for (const resItem of candidate.resumes) {
            const score = resItem.analysis?.atsScore || candidate.atsScore || 70;
            notifs.push({
              id: `res-${resItem.id}`,
              title: 'ATS Resume Scanned',
              desc: `File "${resItem.originalFileName}" evaluated with ${score}% ATS score.`,
              time: formatTimeAgo(resItem.createdAt),
              timestamp: resItem.createdAt,
              read: false,
              icon: 'fa-solid fa-file-shield',
              color: '#059669',
              bg: '#ecfdf5',
              link: '/candidate/resume-checker',
            });
          }
        }
      } else {
        // Recruiter / Admin notifications: Real applications and uploaded resumes
        const recentApps = await prisma.candidateApplication.findMany({
          take: 6,
          orderBy: { appliedAt: 'desc' },
          include: { candidate: true, jobRole: true },
        });

        const recentResumes = await prisma.resume.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { candidate: true, analysis: true },
        });

        for (const app of recentApps) {
          notifs.push({
            id: `rec-app-${app.id}`,
            title: 'New Candidate Application',
            desc: `${app.candidate?.name || 'Candidate'} applied for ${app.jobRole?.title || 'Open Position'} (${app.matchScore}% Match).`,
            time: formatTimeAgo(app.appliedAt),
            timestamp: app.appliedAt,
            read: false,
            icon: 'fa-solid fa-user-plus',
            color: '#2563eb',
            bg: '#eff6ff',
            link: '/candidates',
          });
        }

        for (const r of recentResumes) {
          const score = r.candidate?.atsScore || r.analysis?.atsScore || r.analysis?.overallScore || 75;
          notifs.push({
            id: `rec-res-${r.id}`,
            title: 'Resume Intake Complete',
            desc: `${r.candidate?.name || r.originalFileName} processed with ${score}% ATS score.`,
            time: formatTimeAgo(r.createdAt),
            timestamp: r.createdAt,
            read: false,
            icon: 'fa-solid fa-file-shield',
            color: '#059669',
            bg: '#ecfdf5',
            link: '/resumeupload',
          });
        }
      }

      notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sendSuccess(res, notifs);
    } catch (err) {
      next(err);
    }
  },
};
