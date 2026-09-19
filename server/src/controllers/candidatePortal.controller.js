import { prisma } from '../config/prisma.js';
import { resumeParserService } from '../services/resumeParser.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const candidatePortalController = {
  // 1. Candidate Resume Self-Audit
  async auditResume(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, 'Please upload a resume file (PDF, DOCX, DOC, or TXT)', 400);
      }

      const originalFileName = req.file.originalname;
      const storedFileName = req.file.filename;
      const filePath = req.file.path;
      const fileType = req.file.mimetype;
      const fileSize = req.file.size;

      // Extract raw text and candidate details
      const rawText = await resumeParserService.extractText(filePath, originalFileName);
      const extracted = resumeParserService.extractCandidateInfo(rawText, originalFileName);

      // Analyze structure & ATS metrics
      const wordCount = rawText.split(/\s+/).filter(Boolean).length;
      const hasContact = Boolean(extracted.email && extracted.phone);
      const hasSkills = extracted.skills && extracted.skills.length >= 3;
      const hasEducation = Boolean(extracted.education && extracted.education !== 'Not specified');
      const hasExperience = extracted.experienceYears > 0;

      // Detect strong action verbs in bullet points
      const actionVerbsList = [
        'spearheaded', 'architected', 'developed', 'engineered', 'led', 'designed',
        'optimized', 'implemented', 'reduced', 'increased', 'boosted', 'automated',
        'delivered', 'refactored', 'managed', 'created', 'built', 'resolved',
      ];
      const foundActionVerbs = actionVerbsList.filter((v) =>
        new RegExp(`\\b${v}\\b`, 'i').test(rawText)
      );

      // Calculate ATS Structural Score (0-100)
      let atsScore = 60;
      if (hasContact) atsScore += 10;
      if (hasSkills) atsScore += 10;
      if (hasEducation) atsScore += 10;
      if (hasExperience) atsScore += 5;
      if (foundActionVerbs.length >= 3) atsScore += 5;
      if (wordCount >= 200 && wordCount <= 1000) atsScore += 5;
      atsScore = Math.min(atsScore, 98);

      // Formatting diagnostics
      const formattingChecks = [
        {
          name: 'Contact Information',
          status: hasContact ? 'PASSED' : 'WARNING',
          detail: hasContact
            ? `Email (${extracted.email}) and phone detected.`
            : 'Add a clear phone number and professional email.',
        },
        {
          name: 'Skills Section',
          status: hasSkills ? 'PASSED' : 'WARNING',
          detail: hasSkills
            ? `${extracted.skills.length} technical skills identified.`
            : 'Include a dedicated Skills section with relevant tools & technologies.',
        },
        {
          name: 'Work Experience Structure',
          status: hasExperience ? 'PASSED' : 'REVIEW',
          detail: hasExperience
            ? `${extracted.experienceYears} years experience detected.`
            : 'Ensure your roles have clear start/end dates and company names.',
        },
        {
          name: 'Education Section',
          status: hasEducation ? 'PASSED' : 'INFO',
          detail: hasEducation
            ? `Degree found: ${extracted.education}`
            : 'Specify your highest degree or relevant certifications.',
        },
        {
          name: 'Action Verbs & Impact',
          status: foundActionVerbs.length >= 3 ? 'PASSED' : 'WARNING',
          detail: foundActionVerbs.length >= 3
            ? `Good action verbs found: ${foundActionVerbs.slice(0, 4).join(', ')}.`
            : 'Begin bullet points with strong action verbs (e.g. Engineered, Spearheaded, Optimized).',
        },
        {
          name: 'Length & Readability',
          status: wordCount >= 200 && wordCount <= 900 ? 'PASSED' : 'INFO',
          detail: `${wordCount} words. Standard recommended length is 350 - 800 words (1-2 pages).`,
        },
      ];

      // Missing keywords recommendations for industry standard
      const popularIndustrySkills = [
        'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'System Design', 'CI/CD',
      ];
      const missingRecommendations = popularIndustrySkills.filter(
        (s) => !extracted.skills.some((c) => c.toLowerCase() === s.toLowerCase())
      ).slice(0, 4);

      // Link with authenticated user if logged in
      let candidateRecord = null;
      if (req.user) {
        candidateRecord = await prisma.candidate.findFirst({
          where: {
            OR: [
              { userId: req.user.id },
              { email: req.user.email },
            ],
          },
        });

        if (!candidateRecord) {
          candidateRecord = await prisma.candidate.create({
            data: {
              userId: req.user.id,
              name: `${req.user.firstName} ${req.user.lastName}`.trim(),
              email: req.user.email,
              roleApplied: 'Job Seeker',
              atsScore,
              experienceYears: extracted.experienceYears || 0,
              education: extracted.education,
              phone: extracted.phone,
            },
          });
        } else {
          candidateRecord = await prisma.candidate.update({
            where: { id: candidateRecord.id },
            data: {
              userId: req.user.id,
              atsScore,
              experienceYears: extracted.experienceYears || candidateRecord.experienceYears,
              education: extracted.education || candidateRecord.education,
              phone: extracted.phone || candidateRecord.phone,
            },
          });
        }

        // Save resume reference
        await prisma.resume.create({
          data: {
            candidateId: candidateRecord.id,
            originalFileName,
            storedFileName,
            filePath,
            fileType,
            fileSize,
            extractedText: rawText,
            atsScore,
          },
        });

        // Add or sync candidate skills
        for (const skillName of extracted.skills) {
          let skill = await prisma.skill.findUnique({ where: { name: skillName } });
          if (!skill) {
            skill = await prisma.skill.create({ data: { name: skillName } });
          }
          await prisma.candidateSkill.upsert({
            where: {
              candidateId_skillId: {
                candidateId: candidateRecord.id,
                skillId: skill.id,
              },
            },
            update: { proficiency: 'Proficient' },
            create: {
              candidateId: candidateRecord.id,
              skillId: skill.id,
              proficiency: 'Proficient',
            },
          });
        }
      }

      const auditReport = {
        candidateName: extracted.name || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Candidate'),
        atsScore,
        wordCount,
        extractedSkills: extracted.skills,
        missingRecommendations,
        actionVerbsFound: foundActionVerbs,
        formattingChecks,
        experienceYears: extracted.experienceYears,
        education: extracted.education,
        candidateId: candidateRecord?.id || null,
        fileName: originalFileName,
      };

      return sendSuccess(res, auditReport, 'Resume audit generated successfully');
    } catch (err) {
      next(err);
    }
  },

  // 2. Get Candidate Profile & State
  async getProfile(req, res, next) {
    try {
      const candidate = await prisma.candidate.findFirst({
        where: {
          OR: [
            { userId: req.user.id },
            { email: req.user.email },
          ],
        },
        include: {
          skills: { include: { skill: true } },
          resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
          applications: {
            include: { jobRole: true },
            orderBy: { appliedAt: 'desc' },
          },
        },
      });

      return sendSuccess(res, candidate, 'Candidate profile retrieved');
    } catch (err) {
      next(err);
    }
  },

  // 3. Get Open Jobs with Live Candidate Match Score
  async getJobs(req, res, next) {
    try {
      const jobs = await prisma.jobRole.findMany({
        where: { status: 'ACTIVE' },
        include: {
          skills: { include: { skill: true } },
          applications: {
            where: req.user ? { candidate: { userId: req.user.id } } : undefined,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get candidate skills to calculate personalized match
      let candidateSkills = [];
      if (req.user) {
        const cand = await prisma.candidate.findFirst({
          where: { OR: [{ userId: req.user.id }, { email: req.user.email }] },
          include: { skills: { include: { skill: true } } },
        });
        if (cand?.skills) {
          candidateSkills = cand.skills.map((s) => s.skill.name.toLowerCase());
        }
      }

      const formattedJobs = jobs.map((job) => {
        const requiredSkills = job.skills.map((s) => s.skill.name);
        let matchScore = 72; // baseline

        if (candidateSkills.length > 0 && requiredSkills.length > 0) {
          const matched = requiredSkills.filter((rs) =>
            candidateSkills.includes(rs.toLowerCase())
          );
          matchScore = Math.round(50 + (matched.length / requiredSkills.length) * 45);
          matchScore = Math.min(matchScore, 98);
        }

        const isApplied = Boolean(job.applications && job.applications.length > 0);
        const applicationStatus = isApplied ? job.applications[0].status : null;

        return {
          id: job.id,
          code: job.code,
          title: job.title,
          department: job.department,
          experienceLevel: job.experienceLevel,
          minExperience: job.minExperience,
          description: job.description,
          responsibilities: job.responsibilities,
          openPositions: job.openPositions,
          skills: requiredSkills,
          matchScore,
          isApplied,
          applicationStatus,
        };
      });

      return sendSuccess(res, formattedJobs, 'Active job roles retrieved');
    } catch (err) {
      next(err);
    }
  },

  // 4. Apply for a Job
  async applyForJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await prisma.jobRole.findUnique({
        where: { id: jobId },
        include: { skills: { include: { skill: true } } },
      });

      if (!job) {
        return sendError(res, 'Job role not found', 404);
      }

      let candidate = await prisma.candidate.findFirst({
        where: { OR: [{ userId: req.user.id }, { email: req.user.email }] },
        include: { skills: { include: { skill: true } } },
      });

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            userId: req.user.id,
            name: `${req.user.firstName} ${req.user.lastName}`.trim(),
            email: req.user.email,
            roleApplied: job.title,
            jobRoleId: job.id,
            status: 'ACTIVE',
            currentStage: 'UPLOADED',
          },
        });
      }

      // Check existing application
      const existingApp = await prisma.candidateApplication.findUnique({
        where: {
          candidateId_jobRoleId: {
            candidateId: candidate.id,
            jobRoleId: job.id,
          },
        },
      });

      if (existingApp) {
        return sendSuccess(res, existingApp, 'You have already applied for this position');
      }

      // Calculate match score
      const candidateSkills = candidate.skills?.map((s) => s.skill.name.toLowerCase()) || [];
      const requiredSkills = job.skills.map((s) => s.skill.name.toLowerCase());
      const matched = requiredSkills.filter((rs) => candidateSkills.includes(rs));
      const matchScore = requiredSkills.length > 0
        ? Math.min(Math.round(55 + (matched.length / requiredSkills.length) * 40), 96)
        : 80;

      const application = await prisma.candidateApplication.create({
        data: {
          candidateId: candidate.id,
          jobRoleId: job.id,
          matchScore,
          status: 'APPLIED',
        },
        include: { jobRole: true },
      });

      // Update candidate target role & stage
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          roleApplied: job.title,
          jobRoleId: job.id,
          matchScore,
          currentStage: 'UPLOADED',
          status: 'ACTIVE',
        },
      });

      return sendSuccess(res, application, 'Application submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  // 5. Get Candidate's Applications
  async getMyApplications(req, res, next) {
    try {
      const candidate = await prisma.candidate.findFirst({
        where: { OR: [{ userId: req.user.id }, { email: req.user.email }] },
      });

      if (!candidate) {
        return sendSuccess(res, [], 'No applications found');
      }

      const applications = await prisma.candidateApplication.findMany({
        where: { candidateId: candidate.id },
        include: {
          jobRole: {
            include: { skills: { include: { skill: true } } },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });

      return sendSuccess(res, applications, 'Applications retrieved');
    } catch (err) {
      next(err);
    }
  },
};
