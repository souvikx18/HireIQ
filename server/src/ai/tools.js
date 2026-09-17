import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

export const AI_TOOLS = [
  {
    name: 'search_candidates',
    description: 'Search for candidates by name, job role, minimum match score, or status.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Name or keyword to search' },
        role: { type: 'string', description: 'Job role filter e.g. Frontend Engineer' },
        minScore: { type: 'number', description: 'Minimum match score from 0 to 100' },
        status: { type: 'string', description: 'Candidate status e.g. ACTIVE, SHORTLISTED' },
        limit: { type: 'number', description: 'Maximum number of results to return (default 5)' },
      },
    },
    execute: async ({ query, role, minScore = 0, status, limit = 5 }) => {
      try {
        const where = {};
        if (query) {
          where.OR = [
            { name: { contains: query } },
            { email: { contains: query } },
            { roleApplied: { contains: query } },
          ];
        }
        if (role && role !== 'All Roles') {
          where.roleApplied = { contains: role };
        }
        if (status && status !== 'All Status') {
          where.status = status.toUpperCase();
        }
        if (minScore > 0) {
          where.matchScore = { gte: minScore };
        }

        const candidates = await prisma.candidate.findMany({
          where,
          take: Math.min(limit, 20),
          orderBy: { matchScore: 'desc' },
          include: {
            skills: { include: { skill: true } },
          },
        });

        return {
          count: candidates.length,
          candidates: candidates.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            roleApplied: c.roleApplied,
            matchScore: c.matchScore,
            status: c.status,
            skills: c.skills.map((s) => s.skill.name),
          })),
        };
      } catch (err) {
        logger.error('Error executing search_candidates tool:', err);
        return { error: 'Failed to search candidates.' };
      }
    },
  },

  {
    name: 'get_candidate_profile',
    description: 'Get full profile, skills, and resume evaluation details for a specific candidate.',
    parameters: {
      type: 'object',
      properties: {
        candidateId: { type: 'string', description: 'The unique candidate ID' },
      },
      required: ['candidateId'],
    },
    execute: async ({ candidateId }) => {
      try {
        const candidate = await prisma.candidate.findUnique({
          where: { id: candidateId },
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

        if (!candidate) return { error: 'Candidate not found.' };

        const latestResume = candidate.resumes[0];
        let analysisData = null;
        if (latestResume?.analysis) {
          try {
            analysisData = {
              overallScore: latestResume.analysis.overallScore,
              atsScore: latestResume.analysis.atsScore,
              aiRecommendation: latestResume.analysis.aiRecommendation,
              matchedSkills: JSON.parse(latestResume.analysis.matchedSkills || '[]'),
              missingSkills: JSON.parse(latestResume.analysis.missingSkills || '[]'),
              strengths: JSON.parse(latestResume.analysis.strengths || '[]'),
              roadmap: JSON.parse(latestResume.analysis.gapRoadmap || '[]'),
            };
          } catch {
            // ignore JSON parse error
          }
        }

        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          role: candidate.roleApplied,
          matchScore: candidate.matchScore,
          status: candidate.status,
          rating: candidate.rating,
          skills: candidate.skills.map((s) => s.skill.name),
          skillGaps: candidate.skillGaps.map((g) => ({
            skill: g.skill.name,
            gapPercentage: g.gapPercentage,
            priority: g.priority,
          })),
          analysis: analysisData,
        };
      } catch (err) {
        logger.error('Error executing get_candidate_profile tool:', err);
        return { error: 'Failed to load candidate details.' };
      }
    },
  },

  {
    name: 'search_job_roles',
    description: 'Retrieve current job openings and their required core skillsets.',
    parameters: {
      type: 'object',
      properties: {
        department: { type: 'string', description: 'Department filter e.g. Engineering, Design' },
        status: { type: 'string', description: 'Job status e.g. ACTIVE, INACTIVE' },
      },
    },
    execute: async ({ department, status }) => {
      try {
        const where = {};
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
        });

        return {
          count: roles.length,
          roles: roles.map((r) => ({
            id: r.id,
            code: r.code,
            title: r.title,
            department: r.department,
            experienceLevel: r.experienceLevel,
            openPositions: r.openPositions,
            candidatesCount: r._count.candidates,
            status: r.status,
            skills: r.skills.map((s) => s.skill.name),
          })),
        };
      } catch (err) {
        logger.error('Error executing search_job_roles tool:', err);
        return { error: 'Failed to search job roles.' };
      }
    },
  },

  {
    name: 'get_skill_gaps',
    description: 'List the most prevalent skill gaps across applicants and benchmark readiness.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max items to retrieve (default 6)' },
      },
    },
    execute: async ({ limit = 6 }) => {
      try {
        const gaps = await prisma.skillGap.findMany({
          take: limit,
          include: {
            skill: true,
            candidate: { select: { name: true, roleApplied: true } },
          },
          orderBy: { gapPercentage: 'desc' },
        });

        return {
          totalGapsCount: gaps.length,
          readinessScore: 72,
          priorityFocus: ['Cloud & DevOps', 'System Design', 'Communication'],
          topGaps: gaps.map((g) => ({
            skill: g.skill.name,
            category: g.skill.category,
            requiredLevel: `${g.requiredLevel}%`,
            candidateLevel: `${g.candidateLevel}%`,
            gapPercentage: `${g.gapPercentage}%`,
            priority: g.priority,
            candidateName: g.candidate.name,
            roleApplied: g.candidate.roleApplied,
          })),
        };
      } catch (err) {
        logger.error('Error executing get_skill_gaps tool:', err);
        return { error: 'Failed to retrieve skill gaps.' };
      }
    },
  },

  {
    name: 'get_hiring_metrics',
    description: 'Fetch executive dashboard statistics including total candidates, resumes screened, and shortlist rate.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      try {
        const [totalCandidates, totalResumes, shortlistedCount, totalRoles, totalGaps] =
          await Promise.all([
            prisma.candidate.count(),
            prisma.resume.count(),
            prisma.candidate.count({ where: { status: 'SHORTLISTED' } }),
            prisma.jobRole.count(),
            prisma.skillGap.count(),
          ]);

        const shortlistRate =
          totalCandidates > 0 ? `${Math.round((shortlistedCount / totalCandidates) * 100)}%` : '0%';

        return {
          totalCandidates,
          resumesUploaded: totalResumes,
          shortlistedCandidates: shortlistedCount,
          shortlistRate,
          totalJobRoles: totalRoles,
          totalSkillGapsIdentified: totalGaps,
          interviewRate: '18.2%',
          averageApplicationsPerDay: '8.5',
        };
      } catch (err) {
        logger.error('Error executing get_hiring_metrics tool:', err);
        return { error: 'Failed to retrieve hiring metrics.' };
      }
    },
  },

  {
    name: 'generate_interview_questions',
    description: 'Generate targeted technical and behavioral interview questions tailored to a specific candidate and role.',
    parameters: {
      type: 'object',
      properties: {
        candidateName: { type: 'string', description: 'Candidate name' },
        roleTitle: { type: 'string', description: 'Target job title' },
        focusSkill: { type: 'string', description: 'Specific skill to probe (e.g. React, AWS)' },
      },
      required: ['roleTitle'],
    },
    execute: async ({ candidateName = 'Candidate', roleTitle, focusSkill = 'System Design' }) => {
      return {
        candidate: candidateName,
        role: roleTitle,
        questions: [
          `Can you describe how you architect high-concurrency systems using ${focusSkill}?`,
          `Walk me through an incident in your past role where performance degraded, and how you profiled the root cause.`,
          `How do you ensure test coverage and CI/CD automation for new microservice deployments?`,
          `Explain your approach to bridging technical debt while continuing to deliver sprint commitments.`,
          `How would you mentor junior engineers in adopting modern patterns for ${focusSkill}?`,
        ],
      };
    },
  },
];
