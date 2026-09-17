import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    department: z.string().min(1, 'Department is required'),
    experienceLevel: z.string().min(1, 'Experience level is required'),
    openPositions: z.number().or(z.string()).transform((v) => parseInt(String(v), 10) || 1),
    skills: z.array(z.string()).or(z.string().transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))).optional(),
  }),
});

export const jobController = {
  async listJobs(req, res, next) {
    try {
      const { search, department, experience, status } = req.query;

      const where = {};
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { code: { contains: search } },
          { department: { contains: search } },
        ];
      }
      if (department && department !== 'all') {
        where.department = { contains: department };
      }
      if (status && status !== 'all') {
        where.status = status.toUpperCase();
      }

      const roles = await prisma.jobRole.findMany({
        where,
        include: {
          skills: { include: { skill: true } },
          _count: { select: { candidates: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = roles.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.title,
        title: r.title,
        department: r.department,
        departmentVal: r.department.toLowerCase().replace(/\s+/g, '-'),
        experience: r.experienceLevel,
        experienceVal: r.experienceLevel.toLowerCase().replace(/\s+/g, ''),
        openPositions: r.openPositions,
        candidates: String(r._count.candidates),
        status: r.status === 'ACTIVE' ? 'Active' : 'Inactive',
        statusVal: r.status.toLowerCase(),
        skills: r.skills.map((s) => s.skill.name),
        extraSkillsCount: Math.max(0, r.skills.length - 3),
        createdDate: new Date(r.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }));

      return sendSuccess(res, formatted);
    } catch (err) {
      next(err);
    }
  },

  async getJob(req, res, next) {
    try {
      const { id } = req.params;
      const role = await prisma.jobRole.findFirst({
        where: { OR: [{ id }, { code: id }] },
        include: {
          skills: { include: { skill: true } },
          candidates: true,
        },
      });

      if (!role) {
        return sendError(res, 'Job role not found', 404);
      }

      return sendSuccess(res, role);
    } catch (err) {
      next(err);
    }
  },

  async createJob(req, res, next) {
    try {
      const { title, department, experienceLevel, openPositions, skills = [] } = req.body;

      // Generate code prefix (e.g. "Full Stack Developer" -> "FS-008")
      const words = title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean);
      let prefix = '';
      if (words.length >= 2) {
        prefix = (words[0][0] + words[1][0]).toUpperCase();
      } else {
        prefix = (words[0] || 'JR').slice(0, 2).toUpperCase();
      }
      const count = await prisma.jobRole.count();
      const code = `${prefix}-${String(count + 1).padStart(3, '0')}`;

      const jobRole = await prisma.jobRole.create({
        data: {
          code,
          title: title.trim(),
          department: department.trim(),
          experienceLevel: experienceLevel.trim(),
          openPositions,
          status: 'ACTIVE',
        },
      });

      // Link skills
      const skillList = Array.isArray(skills) ? skills : [];
      for (const skillName of skillList) {
        const trimmed = skillName.trim();
        if (!trimmed) continue;
        const skill = await prisma.skill.upsert({
          where: { name: trimmed },
          update: {},
          create: { name: trimmed },
        });

        await prisma.jobSkill.create({
          data: {
            jobRoleId: jobRole.id,
            skillId: skill.id,
          },
        });
      }

      return sendSuccess(res, jobRole, 'Job role created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteJob(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.jobRole.delete({
        where: { id },
      });
      return sendSuccess(res, null, 'Job role deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
