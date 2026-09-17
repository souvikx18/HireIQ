import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

export const auditService = {
  async log({
    userId = null,
    actorEmail = null,
    action,
    resource,
    targetEntity = null,
    targetId = null,
    details = null,
    status = 'SUCCESS',
    ipAddress = null,
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          actorEmail,
          action,
          resource,
          targetEntity,
          targetId,
          details: typeof details === 'object' ? JSON.stringify(details) : details,
          status,
          ipAddress,
        },
      });
    } catch (err) {
      logger.error('Failed to create audit log entry:', err);
      // Non-blocking for primary application flow
      return null;
    }
  },

  async getLogs({ page = 1, limit = 50, action = null, resource = null, search = '' } = {}) {
    const take = Math.min(Number(limit) || 50, 100);
    const skip = ((Number(page) || 1) - 1) * take;

    const where = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { actorEmail: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: take,
        pages: Math.ceil(total / take),
      },
    };
  },
};
