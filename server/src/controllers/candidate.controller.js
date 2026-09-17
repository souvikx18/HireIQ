import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const updateCandidateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SHORTLISTED', 'UNDER_REVIEW', 'MAYBE', 'REJECTED', 'HIRED']),
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
      const { role, status, search } = req.query;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { roleApplied: { contains: search } },
        ];
      }
      if (role && role !== 'All Roles') {
        where.roleApplied = { contains: role };
      }
      if (status && status !== 'All Status') {
        const normalized = status.toUpperCase().replace(/\s+/g, '_');
        where.status = normalized;
      }

      const candidates = await prisma.candidate.findMany({
        where,
        include: {
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
      const { status } = req.body;

      const updated = await prisma.candidate.update({
        where: { id },
        data: { status },
      });

      return sendSuccess(res, updated, 'Candidate status updated');
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
};
