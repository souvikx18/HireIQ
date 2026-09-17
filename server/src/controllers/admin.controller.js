import { prisma } from '../config/prisma.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { normalizeRole } from '../middleware/rbac.js';

export const adminController = {
  async getSystemHealth(req, res, next) {
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - startTime;

      const mem = process.memoryUsage();

      const [usersCount, jobsCount, candidatesCount, resumesCount, logsCount] = await Promise.all([
        prisma.user.count(),
        prisma.jobRole.count(),
        prisma.candidate.count(),
        prisma.resume.count(),
        prisma.auditLog.count(),
      ]);

      const health = {
        status: 'OPERATIONAL',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          provider: 'PostgreSQL (Supabase)',
          status: 'CONNECTED',
          latencyMs: dbLatency,
        },
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        },
        counts: {
          totalUsers: usersCount,
          totalJobs: jobsCount,
          totalCandidates: candidatesCount,
          totalResumes: resumesCount,
          totalAuditLogs: logsCount,
        },
      };

      return sendSuccess(res, health);
    } catch (err) {
      next(err);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const { page, limit, search, action, resource } = req.query;
      const data = await auditService.getLogs({ page, limit, search, action, resource });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async listUsers(req, res, next) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return sendError(res, 'Role is required', 400);
      }

      const normalized = normalizeRole(role);
      const user = await prisma.user.update({
        where: { id },
        data: { role: normalized },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      await auditService.log({
        userId: req.user?.userId || null,
        actorEmail: req.user?.email || 'admin',
        action: 'USER_ROLE_CHANGED',
        resource: 'User',
        targetEntity: 'User',
        targetId: id,
        details: { newRole: normalized, targetEmail: user.email },
        ipAddress: req.ip,
      });

      return sendSuccess(res, user, 'User role updated successfully');
    } catch (err) {
      next(err);
    }
  },
};
