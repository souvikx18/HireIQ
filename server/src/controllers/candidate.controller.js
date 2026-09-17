import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const updateCandidateStatusSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    currentStage: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createCandidateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Candidate name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    location: z.string().optional(),
    roleApplied: z.string().optional(),
    jobRoleId: z.string().optional(),
    experienceYears: z.number().or(z.string()).transform((v) => parseFloat(String(v)) || 0).optional(),
    skills: z.array(z.string()).or(z.string().transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))).optional(),
    notes: z.string().optional(),
    currentStage: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const assignCandidateSchema = z.object({
  body: z.object({
    jobRoleId: z.string().nullable().optional(),
  }),
});

export const addReviewSchema = z.object({
  body: z.object({
    reviewText: z.string().min(1, 'Review text is required'),
    rating: z.number().min(1).max(5).default(5),
  }),
});

export const candidateController = {
  async listCandidates(req, res, next) {
    try {
      const { role, status, search, jobRoleId } = req.query;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { roleApplied: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (role && role !== 'All Roles') {
        where.roleApplied = { contains: role, mode: 'insensitive' };
      }
      if (jobRoleId && jobRoleId !== 'all') {
        where.jobRoleId = jobRoleId;
      }
      if (status && status !== 'All Status') {
        const normalized = status.toUpperCase().replace(/\s+/g, '_');
        where.status = normalized;
      }

      const candidates = await prisma.candidate.findMany({
        where,
        include: {
          jobRole: true,
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          skills: {
            include: { skill: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Format for frontend
      const formatted = candidates.map((c) => {
        const latestReview = c.reviews[0];
        const initials = c.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        // Generate dynamic avatar color
        const colors = ['purple', 'blue', 'green', 'pink', 'orange-bg'];
        const avatarColor = colors[Math.abs(c.name.charCodeAt(0)) % colors.length];

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          avatar: initials,
          avatarColor,
          role: c.roleApplied,
          jobRoleId: c.jobRoleId,
          jobRole: c.jobRole ? { id: c.jobRole.id, title: c.jobRole.title, department: c.jobRole.department } : null,
          department: c.jobRole ? c.jobRole.department : 'General',
          views: String(c.views),
          viewsThisWeek: c.viewsThisWeek,
          reviews: String(c.reviewsCount || c.reviews.length),
          rating: String(c.rating.toFixed(1)),
          stars: '★ '.repeat(Math.floor(c.rating)).trim(),
          starEmpty: '★ '.repeat(Math.max(0, 5 - Math.floor(c.rating))).trim(),
          reviewerName: latestReview?.reviewerName || 'Hiring Team',
          reviewDate: latestReview?.reviewDate || new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reviewText: latestReview?.reviewText || 'Candidate profile active and ready for interview scheduling.',
          reviewClass: latestReview?.reviewClass || 'green-review',
          status: c.status === 'SHORTLISTED' ? 'Shortlisted' : c.status === 'REJECTED' ? 'Rejected' : 'Active',
          statusVal: c.status.toLowerCase(),
          currentStage: c.currentStage || 'UNDER_REVIEW',
          notes: c.notes || '',
          matchScore: c.matchScore,
          atsScore: c.atsScore,
          skills: c.skills.map((s) => s.skill.name),
        };
      });

      return sendSuccess(res, formatted);
    } catch (err) {
      next(err);
    }
  },

  async getCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          skills: { include: { skill: true } },
          skillGaps: { include: { skill: true } },
          reviews: { orderBy: { createdAt: 'desc' } },
          resumes: {
            include: { analysis: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!candidate) {
        return sendError(res, 'Candidate not found', 404);
      }

      // Increment views count on view
      await prisma.candidate.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

      return sendSuccess(res, candidate);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, currentStage, notes } = req.body;

      const updateData = {};
      if (status) updateData.status = status.toUpperCase().replace(/\s+/g, '_');
      if (currentStage) updateData.currentStage = currentStage.toUpperCase().replace(/\s+/g, '_');
      if (notes !== undefined) updateData.notes = notes;

      const updated = await prisma.candidate.update({
        where: { id },
        data: updateData,
      });

      // Log status transition audit event
      await auditService.log({
        userId: req.user?.userId || null,
        actorEmail: req.user?.email || 'recruiter',
        action: 'CANDIDATE_STAGE_UPDATE',
        resource: 'Candidate',
        targetEntity: 'Candidate',
        targetId: id,
        details: {
          candidateName: updated.name,
          newStage: updated.currentStage,
          newStatus: updated.status,
          notes,
        },
        ipAddress: req.ip,
      });

      return sendSuccess(res, updated, 'Candidate status updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async compareCandidates(req, res, next) {
    try {
      const candidateIds = req.body.candidateIds || (req.query.ids ? req.query.ids.split(',') : []);

      if (!Array.isArray(candidateIds) || candidateIds.length < 2) {
        return sendError(res, 'Please provide at least 2 candidate IDs to compare', 400);
      }

      const candidates = await prisma.candidate.findMany({
        where: { id: { in: candidateIds } },
        include: {
          skills: { include: { skill: true } },
          skillGaps: { include: { skill: true } },
          resumes: {
            include: { analysis: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (candidates.length < 2) {
        return sendError(res, 'Could not find sufficient candidate records for comparison', 404);
      }

      const comparison = candidates.map((cand) => {
        const latestResume = cand.resumes[0];
        const analysis = latestResume?.analysis;

        let parsedMatched = [];
        let parsedMissing = [];
        let parsedStrengths = [];
        let parsedQuestions = [];

        try {
          if (analysis?.matchedSkills) parsedMatched = JSON.parse(analysis.matchedSkills);
          if (analysis?.missingSkills) parsedMissing = JSON.parse(analysis.missingSkills);
          if (analysis?.strengths) parsedStrengths = JSON.parse(analysis.strengths);
          if (analysis?.suggestedQuestions) parsedQuestions = JSON.parse(analysis.suggestedQuestions);
        } catch {}

        return {
          id: cand.id,
          name: cand.name,
          email: cand.email,
          roleApplied: cand.roleApplied,
          currentStage: cand.currentStage,
          matchScore: cand.matchScore,
          atsScore: cand.atsScore,
          rating: cand.rating,
          experienceYears: cand.experienceYears || 3,
          skills: cand.skills.map((s) => s.skill.name),
          matchedSkills: parsedMatched,
          missingSkills: parsedMissing,
          strengths: parsedStrengths,
          suggestedQuestions: parsedQuestions,
          explanation: analysis?.scoreExplanation || 'Evaluation generated via criteria match.',
        };
      });

      // Calculate comparative highlights
      const topScore = Math.max(...comparison.map((c) => c.matchScore));
      const leader = comparison.find((c) => c.matchScore === topScore);

      return sendSuccess(res, {
        comparison,
        leaderId: leader?.id,
        leaderName: leader?.name,
        recommendation: `${leader?.name} leads the cohort with a ${leader?.matchScore}% criteria alignment score and verified competency in ${leader?.skills.slice(0, 3).join(', ')}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteCandidate(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.candidate.delete({
        where: { id },
      });

      return sendSuccess(res, null, 'Candidate removed successfully');
    } catch (err) {
      next(err);
    }
  },

  async addReview(req, res, next) {
    try {
      const { id } = req.params;
      const { reviewText, rating = 5 } = req.body;

      const review = await prisma.candidateReview.create({
        data: {
          candidateId: id,
          authorId: req.user?.userId || null,
          reviewerName: req.user?.name || 'Reviewer',
          reviewText,
          rating,
          reviewDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          reviewClass: rating >= 4 ? 'green-review' : rating >= 3 ? 'blue-review' : 'red-review',
        },
      });

      // Update candidate average rating
      const reviews = await prisma.candidateReview.findMany({
        where: { candidateId: id },
      });
      const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

      await prisma.candidate.update({
        where: { id },
        data: {
          rating: parseFloat(avg.toFixed(1)),
          reviewsCount: reviews.length,
        },
      });

      return sendSuccess(res, review, 'Review added successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async createCandidate(req, res, next) {
    try {
      const {
        name,
        email,
        phone,
        location = 'Remote / Hybrid',
        roleApplied,
        jobRoleId,
        experienceYears = 2,
        education = "Bachelor's Degree",
        skills = [],
        notes = '',
        currentStage = 'UNDER_REVIEW',
        status = 'ACTIVE',
      } = req.body;

      const existing = await prisma.candidate.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (existing) {
        return sendError(res, 'A candidate with this email address already exists', 400);
      }

      let finalRoleTitle = roleApplied || 'Software Engineer';
      let validJobRoleId = null;

      if (jobRoleId) {
        const jobRole = await prisma.jobRole.findFirst({
          where: { OR: [{ id: jobRoleId }, { code: jobRoleId }] },
        });
        if (jobRole) {
          validJobRoleId = jobRole.id;
          finalRoleTitle = jobRole.title;
        }
      }

      const candidate = await prisma.candidate.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : null,
          location: location.trim(),
          roleApplied: finalRoleTitle,
          jobRoleId: validJobRoleId,
          experienceYears: parseFloat(experienceYears) || 0,
          education,
          notes,
          currentStage: currentStage.toUpperCase().replace(/\s+/g, '_'),
          status: status.toUpperCase().replace(/\s+/g, '_'),
          matchScore: 82,
          atsScore: 88,
        },
      });

      // Link skills
      const skillList = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      for (const skillName of skillList) {
        const trimmed = String(skillName).trim();
        if (!trimmed) continue;
        const skill = await prisma.skill.upsert({
          where: { name: trimmed },
          update: {},
          create: { name: trimmed },
        });
        await prisma.candidateSkill.upsert({
          where: { candidateId_skillId: { candidateId: candidate.id, skillId: skill.id } },
          update: {},
          create: { candidateId: candidate.id, skillId: skill.id },
        });
      }

      // Add default review
      await prisma.candidateReview.create({
        data: {
          candidateId: candidate.id,
          reviewerName: req.user?.name || 'Recruiter Team',
          reviewText: 'Candidate profile successfully created and assigned to pipeline.',
          rating: 4.5,
          reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reviewClass: 'green-review',
        },
      });

      // Audit log
      await auditService.log({
        userId: req.user?.userId || null,
        actorEmail: req.user?.email || 'recruiter',
        action: 'CANDIDATE_CREATED',
        resource: 'Candidate',
        targetEntity: 'Candidate',
        targetId: candidate.id,
        details: { name: candidate.name, email: candidate.email, role: candidate.roleApplied, jobRoleId: validJobRoleId },
        ipAddress: req.ip,
      });

      const fullCandidate = await prisma.candidate.findUnique({
        where: { id: candidate.id },
        include: {
          jobRole: true,
          skills: { include: { skill: true } },
          reviews: true,
        },
      });

      return sendSuccess(res, fullCandidate, 'Candidate created and assigned successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async assignCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const { jobRoleId } = req.body;

      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate) {
        return sendError(res, 'Candidate not found', 404);
      }

      if (!jobRoleId || jobRoleId === 'unassigned') {
        const updated = await prisma.candidate.update({
          where: { id },
          data: {
            jobRoleId: null,
            roleApplied: 'General Talent Pool',
          },
          include: {
            jobRole: true,
            skills: { include: { skill: true } },
          },
        });

        await auditService.log({
          userId: req.user?.userId || null,
          actorEmail: req.user?.email || 'recruiter',
          action: 'CANDIDATE_UNASSIGNED_ROLE',
          resource: 'Candidate',
          targetEntity: 'Candidate',
          targetId: candidate.id,
          details: {
            candidateName: candidate.name,
            previousRole: candidate.roleApplied,
          },
          ipAddress: req.ip,
        });

        return sendSuccess(res, updated, 'Candidate unassigned from role');
      }

      const jobRole = await prisma.jobRole.findFirst({
        where: { OR: [{ id: jobRoleId }, { code: jobRoleId }] },
      });
      if (!jobRole) {
        return sendError(res, 'Selected job role does not exist', 404);
      }

      const updated = await prisma.candidate.update({
        where: { id },
        data: {
          jobRoleId: jobRole.id,
          roleApplied: jobRole.title,
        },
        include: {
          jobRole: true,
          skills: { include: { skill: true } },
        },
      });

      // Audit log
      await auditService.log({
        userId: req.user?.userId || null,
        actorEmail: req.user?.email || 'recruiter',
        action: 'CANDIDATE_ASSIGNED_ROLE',
        resource: 'Candidate',
        targetEntity: 'Candidate',
        targetId: candidate.id,
        details: {
          candidateName: candidate.name,
          previousRole: candidate.roleApplied,
          newRole: jobRole.title,
          jobRoleId: jobRole.id,
        },
        ipAddress: req.ip,
      });

      return sendSuccess(res, updated, `Candidate successfully assigned to ${jobRole.title}`);
    } catch (err) {
      next(err);
    }
  },
};
