import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    department: z.string().min(1, 'Department is required'),
    experienceLevel: z.string().min(1, 'Experience level is required'),
    openPositions: z.number().or(z.string()).transform((v) => parseInt(String(v), 10) || 1),
    minExperience: z.number().or(z.string()).transform((v) => parseFloat(String(v)) || 0).optional(),
    educationLevel: z.string().optional(),
    description: z.string().optional(),
    responsibilities: z.string().optional(),
    skills: z.array(z.string()).or(z.string().transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))).optional(),
    requiredSkills: z.array(z.string()).optional(),
    preferredSkills: z.array(z.string()).optional(),
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
      const {
        title,
        department,
        experienceLevel,
        openPositions,
        minExperience = 0,
        educationLevel = "Bachelor's or equivalent",
        description,
        responsibilities,
        skills = [],
        requiredSkills = [],
        preferredSkills = [],
      } = req.body;

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
          minExperience: parseFloat(String(minExperience)) || 0,
          educationLevel: educationLevel.trim(),
          description: description?.trim() || null,
          responsibilities: responsibilities?.trim() || null,
          status: 'ACTIVE',
        },
      });

      // Assemble criteria lists
      const reqList = Array.isArray(requiredSkills) && requiredSkills.length > 0 ? requiredSkills : skills;
      const prefList = Array.isArray(preferredSkills) ? preferredSkills : [];

      // Link required skills
      for (const skillName of reqList) {
        const trimmed = String(skillName).trim();
        if (!trimmed) continue;
        const skill = await prisma.skill.upsert({
          where: { name: trimmed },
          update: {},
          create: { name: trimmed },
        });

        await prisma.jobSkill.upsert({
          where: { jobRoleId_skillId: { jobRoleId: jobRole.id, skillId: skill.id } },
          update: { required: true },
          create: {
            jobRoleId: jobRole.id,
            skillId: skill.id,
            required: true,
          },
        });
      }

      // Link preferred skills
      for (const skillName of prefList) {
        const trimmed = String(skillName).trim();
        if (!trimmed) continue;
        const skill = await prisma.skill.upsert({
          where: { name: trimmed },
          update: {},
          create: { name: trimmed },
        });

        await prisma.jobSkill.upsert({
          where: { jobRoleId_skillId: { jobRoleId: jobRole.id, skillId: skill.id } },
          update: { required: false },
          create: {
            jobRoleId: jobRole.id,
            skillId: skill.id,
            required: false,
          },
        });
      }

      // Log audit
      await auditService.log({
        userId: req.user?.userId || null,
        actorEmail: req.user?.email || 'recruiter',
        action: 'JOB_ROLE_CREATED',
        resource: 'JobRole',
        targetEntity: 'JobRole',
        targetId: jobRole.id,
        details: { title: jobRole.title, code: jobRole.code, department: jobRole.department },
        ipAddress: req.ip,
      });

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
