import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const skillController = {
  /**
   * List all skills with filtering and benchmark stats
   */
  async listSkills(req, res, next) {
    try {
      const { search = '', category = 'all', requiredOnly = 'false' } = req.query;

      const whereClause = {};

      if (search && search.trim()) {
        whereClause.name = {
          contains: search.trim(),
          mode: 'insensitive',
        };
      }

      if (category && category !== 'all') {
        whereClause.category = category.toUpperCase();
      }

      if (requiredOnly === 'true') {
        whereClause.isCompanyRequired = true;
      }

      const skills = await prisma.skill.findMany({
        where: whereClause,
        orderBy: [
          { isCompanyRequired: 'desc' },
          { requiredBenchmark: 'desc' },
          { name: 'asc' },
        ],
        include: {
          _count: {
            select: {
              jobSkills: true,
              candidateSkills: true,
            },
          },
        },
      });

      // Calculate aggregate benchmarks
      const total = skills.length;
      const mandatoryCount = skills.filter((s) => s.isCompanyRequired).length;
      const avgBenchmark = total > 0
        ? Math.round(skills.reduce((acc, s) => acc + (s.requiredBenchmark || 70), 0) / total)
        : 75;

      const categoryCounts = skills.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {});

      return sendSuccess(res, {
        skills,
        stats: {
          totalSkills: total,
          mandatoryCount,
          avgBenchmark,
          categoryCounts,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create a new company skill requirement
   */
  async createSkill(req, res, next) {
    try {
      const {
        name,
        category = 'TECHNICAL',
        requiredBenchmark = 70,
        isCompanyRequired = false,
        importance = 'HIGH',
        description = '',
        marketDemandPercent = 50,
      } = req.body;

      if (!name || !name.trim()) {
        return sendError(res, 'Skill name is required', 400);
      }

      const benchmarkNum = Math.min(100, Math.max(0, parseInt(requiredBenchmark, 10) || 70));

      // Upsert to handle potential duplicates gracefully
      const skill = await prisma.skill.upsert({
        where: { name: name.trim() },
        update: {
          category: category.toUpperCase(),
          requiredBenchmark: benchmarkNum,
          isCompanyRequired: Boolean(isCompanyRequired),
          importance: importance.toUpperCase(),
          description: description ? description.trim() : null,
          marketDemandPercent: parseInt(marketDemandPercent, 10) || 50,
        },
        create: {
          name: name.trim(),
          category: category.toUpperCase(),
          requiredBenchmark: benchmarkNum,
          isCompanyRequired: Boolean(isCompanyRequired),
          importance: importance.toUpperCase(),
          description: description ? description.trim() : null,
          marketDemandPercent: parseInt(marketDemandPercent, 10) || 50,
        },
      });

      // Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: 'CREATE_SKILL_BENCHMARK',
            resource: `Skill:${skill.name}`,
            actorEmail: req.user?.email || 'admin@hireiq.com',
            details: JSON.stringify({
              name: skill.name,
              requiredBenchmark: skill.requiredBenchmark,
              isCompanyRequired: skill.isCompanyRequired,
            }),
          },
        });
      } catch (logErr) {
        logger.warn('Audit logging failed for createSkill', logErr);
      }

      return sendSuccess(res, skill, 'Skill benchmark requirement configured successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing skill benchmark requirement
   */
  async updateSkill(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        category,
        requiredBenchmark,
        isCompanyRequired,
        importance,
        description,
        marketDemandPercent,
      } = req.body;

      const existing = await prisma.skill.findUnique({ where: { id } });
      if (!existing) {
        return sendError(res, 'Skill not found', 404);
      }

      const dataToUpdate = {};
      if (name !== undefined) dataToUpdate.name = name.trim();
      if (category !== undefined) dataToUpdate.category = category.toUpperCase();
      if (requiredBenchmark !== undefined) {
        dataToUpdate.requiredBenchmark = Math.min(100, Math.max(0, parseInt(requiredBenchmark, 10) || 0));
      }
      if (isCompanyRequired !== undefined) {
        dataToUpdate.isCompanyRequired = Boolean(isCompanyRequired);
      }
      if (importance !== undefined) {
        dataToUpdate.importance = importance.toUpperCase();
      }
      if (description !== undefined) {
        dataToUpdate.description = description ? description.trim() : null;
      }
      if (marketDemandPercent !== undefined) {
        dataToUpdate.marketDemandPercent = parseInt(marketDemandPercent, 10) || 50;
      }

      const updated = await prisma.skill.update({
        where: { id },
        data: dataToUpdate,
      });

      // Audit log
      try {
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE_SKILL_BENCHMARK',
            resource: `Skill:${updated.name}`,
            actorEmail: req.user?.email || 'admin@hireiq.com',
            details: JSON.stringify(dataToUpdate),
          },
        });
      } catch (logErr) {
        logger.warn('Audit logging failed for updateSkill', logErr);
      }

      return sendSuccess(res, updated, 'Skill benchmark updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a skill requirement
   */
  async deleteSkill(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await prisma.skill.findUnique({ where: { id } });
      if (!existing) {
        return sendError(res, 'Skill not found', 404);
      }

      await prisma.skill.delete({ where: { id } });

      try {
        await prisma.auditLog.create({
          data: {
            action: 'DELETE_SKILL_BENCHMARK',
            resource: `Skill:${existing.name}`,
            actorEmail: req.user?.email || 'admin@hireiq.com',
          },
        });
      } catch (logErr) {
        logger.warn('Audit logging failed for deleteSkill', logErr);
      }

      return sendSuccess(res, { id }, 'Skill requirement deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Seed default company hiring skills if empty
   */
  async seedDefaultSkills(req, res, next) {
    try {
      const defaultCompanySkills = [
        { name: 'JavaScript', category: 'TECHNICAL', requiredBenchmark: 80, isCompanyRequired: true, importance: 'CRITICAL', description: 'Core ES6+, asynchronous patterns, event loop' },
        { name: 'React', category: 'TECHNICAL', requiredBenchmark: 85, isCompanyRequired: true, importance: 'CRITICAL', description: 'Modern hooks, state management, component architecture' },
        { name: 'Node.js', category: 'TECHNICAL', requiredBenchmark: 75, isCompanyRequired: true, importance: 'HIGH', description: 'Express, REST APIs, middleware, event emitters' },
        { name: 'Python', category: 'TECHNICAL', requiredBenchmark: 70, isCompanyRequired: false, importance: 'HIGH', description: 'Scripting, backend frameworks, data handling' },
        { name: 'SQL', category: 'TECHNICAL', requiredBenchmark: 75, isCompanyRequired: true, importance: 'HIGH', description: 'PostgreSQL queries, relational schema design, indexing' },
        { name: 'TypeScript', category: 'TECHNICAL', requiredBenchmark: 75, isCompanyRequired: false, importance: 'HIGH', description: 'Type safety, generics, interface modeling' },
        { name: 'Docker', category: 'TOOLS', requiredBenchmark: 70, isCompanyRequired: false, importance: 'HIGH', description: 'Containerization, Dockerfile optimization, multi-stage builds' },
        { name: 'AWS', category: 'TOOLS', requiredBenchmark: 80, isCompanyRequired: true, importance: 'HIGH', description: 'S3, EC2, Lambda, IAM, VPC cloud infrastructure' },
        { name: 'Kubernetes', category: 'TOOLS', requiredBenchmark: 70, isCompanyRequired: false, importance: 'MEDIUM', description: 'Pod orchestration, deployments, ingress management' },
        { name: 'System Design', category: 'TECHNICAL', requiredBenchmark: 75, isCompanyRequired: true, importance: 'CRITICAL', description: 'Scalability, microservices, caching strategies, CAP theorem' },
        { name: 'Communication', category: 'SOFT_SKILLS', requiredBenchmark: 80, isCompanyRequired: true, importance: 'CRITICAL', description: 'Cross-functional collaboration, technical articulation' },
        { name: 'Problem Solving', category: 'SOFT_SKILLS', requiredBenchmark: 85, isCompanyRequired: true, importance: 'CRITICAL', description: 'Algorithmic efficiency, debugging and root-cause analysis' },
      ];

      for (const item of defaultCompanySkills) {
        await prisma.skill.upsert({
          where: { name: item.name },
          update: {
            requiredBenchmark: item.requiredBenchmark,
            isCompanyRequired: item.isCompanyRequired,
            importance: item.importance,
            description: item.description,
          },
          create: {
            ...item,
            marketDemandPercent: 65,
          },
        });
      }

      const all = await prisma.skill.findMany({
        orderBy: [{ isCompanyRequired: 'desc' }, { requiredBenchmark: 'desc' }],
      });

      return sendSuccess(res, all, 'Default company skill benchmarks seeded successfully');
    } catch (err) {
      next(err);
    }
  },
};
