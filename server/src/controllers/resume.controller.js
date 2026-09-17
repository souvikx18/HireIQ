import { prisma } from '../config/prisma.js';
import { resumeParserService } from '../services/resumeParser.service.js';
import { matchingEngineService } from '../services/matchingEngine.service.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const resumeController = {
  async uploadAndAnalyze(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, 'Please upload a resume file (PDF, DOCX, DOC, or TXT)', 400);
      }

      const { jobRoleId } = req.body;
      const originalFileName = req.file.originalname;
      const storedFileName = req.file.filename;
      const filePath = req.file.path;
      const fileSize = req.file.size;
      const fileType = req.file.mimetype;

      // 1. Extract raw text from resume
      const rawText = await resumeParserService.extractText(filePath, originalFileName);

      // 2. Extract candidate information & skills
      const extracted = resumeParserService.extractCandidateInfo(rawText, originalFileName);

      // 3. Find target job role for evaluation
      let targetJobRole = null;
      if (jobRoleId) {
        targetJobRole = await prisma.jobRole.findUnique({
          where: { id: jobRoleId },
          include: { skills: { include: { skill: true } } },
        });
      }

      if (!targetJobRole) {
        // Fallback: match by title or pick the first active role
        targetJobRole = await prisma.jobRole.findFirst({
          where: { status: 'ACTIVE' },
          include: { skills: { include: { skill: true } } },
        });
      }

      // 4. Run semantic matching engine
      const evaluation = matchingEngineService.evaluateMatch({
        candidateSkills: extracted.skills,
        candidateInfo: extracted,
        jobRole: targetJobRole,
      });

      // 5. Save or update Candidate record in database
      let candidate = await prisma.candidate.findUnique({
        where: { email: extracted.email },
      });

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            name: extracted.name,
            email: extracted.email,
            phone: extracted.phone,
            roleApplied: targetJobRole?.title || 'Applicant',
            jobRoleId: targetJobRole?.id || null,
            matchScore: evaluation.matchScore,
            atsScore: evaluation.atsScore,
            status: evaluation.matchScore >= 85 ? 'SHORTLISTED' : 'ACTIVE',
            views: 1,
          },
        });
      } else {
        candidate = await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            matchScore: evaluation.matchScore,
            atsScore: evaluation.atsScore,
            jobRoleId: targetJobRole?.id || candidate.jobRoleId,
          },
        });
      }

      // 6. Save Resume record
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          originalFileName,
          storedFileName,
          filePath,
          fileType,
          fileSize,
          parsingStatus: 'COMPLETED',
          rawText,
        },
      });

      // 7. Save ResumeAnalysis record with explainable criteria breakdown
      await prisma.resumeAnalysis.create({
        data: {
          resumeId: resume.id,
          overallScore: evaluation.matchScore,
          atsScore: evaluation.atsScore,
          skillCoverage: evaluation.skillCoverage,
          experienceMatch: `${evaluation.matchScore}% Match`,
          jdMatch: `${evaluation.matchScore}% Semantic Fit`,
          aiConfidence: evaluation.aiConfidence,
          aiRecommendation: evaluation.aiRecommendation,
          matchedSkills: JSON.stringify(evaluation.matchedSkills),
          missingSkills: JSON.stringify(evaluation.missingSkills),
          partialSkills: JSON.stringify(evaluation.partialSkills),
          requiredMatched: JSON.stringify(evaluation.requiredMatched),
          requiredMissing: JSON.stringify(evaluation.requiredMissing),
          preferredMatched: JSON.stringify(evaluation.preferredMatched),
          preferredMissing: JSON.stringify(evaluation.preferredMissing),
          suggestedQuestions: JSON.stringify(evaluation.suggestedQuestions),
          concerns: JSON.stringify(evaluation.concerns),
          strengths: JSON.stringify(evaluation.strengths),
          gapRoadmap: JSON.stringify(evaluation.roadmapSteps),
          scoreExplanation: evaluation.scoreExplanation,
          courseRecommendation: evaluation.courseRecommendation,
        },
      });

      // Log audit event
      await auditService.log({
        userId: req.user?.userId || null,
        actorEmail: req.user?.email || 'recruiter',
        action: 'RESUME_UPLOAD_EVALUATED',
        resource: 'Resume',
        targetEntity: 'Candidate',
        targetId: candidate.id,
        details: {
          candidateName: candidate.name,
          matchScore: evaluation.matchScore,
          targetRole: targetJobRole?.title,
          fileName: originalFileName,
        },
        ipAddress: req.ip,
      });

      // 8. Associate candidate skills & skill gaps in DB
      for (const sk of extracted.skills) {
        const skillRecord = await prisma.skill.upsert({
          where: { name: sk },
          update: {},
          create: { name: sk },
        });

        await prisma.candidateSkill.upsert({
          where: {
            candidateId_skillId: {
              candidateId: candidate.id,
              skillId: skillRecord.id,
            },
          },
          update: {},
          create: {
            candidateId: candidate.id,
            skillId: skillRecord.id,
            proficiency: 'Proficient',
          },
        });
      }

      // Clear old gaps and insert new detected gaps
      await prisma.skillGap.deleteMany({ where: { candidateId: candidate.id } });
      for (const gap of evaluation.gapPriorities) {
        const skillRecord = await prisma.skill.upsert({
          where: { name: gap.name },
          update: {},
          create: { name: gap.name },
        });

        await prisma.skillGap.create({
          data: {
            candidateId: candidate.id,
            skillId: skillRecord.id,
            requiredLevel: 80,
            candidateLevel: 30,
            gapPercentage: 50,
            priority: gap.priority === 'Critical' ? 'CRITICAL' : 'HIGH',
            learningPlan: `Master ${gap.name}`,
          },
        });
      }

      // 9. Return complete evaluation response format for the frontend
      const responseData = {
        id: candidate.id,
        name: candidate.name,
        matchRole: targetJobRole?.title || 'Applicant',
        avatar: candidate.name.slice(0, 2).toUpperCase(),
        matchScore: evaluation.matchScore,
        matchTitle: evaluation.matchScore >= 85 ? 'Strong Technical Match' : 'Alignment Match',
        matchDesc: `${candidate.name} matches ${evaluation.matchedSkillsCount} out of ${evaluation.requiredSkillsCount} required core skills.`,
        atsScore: evaluation.atsScore,
        skillCoverage: evaluation.skillCoverage,
        requiredSkillsCount: evaluation.requiredSkillsCount,
        matchedSkillsCount: evaluation.matchedSkillsCount,
        partialSkillsCount: evaluation.partialSkillsCount,
        missingSkillsCount: evaluation.missingSkillsCount,
        experienceMatch: `${extracted.experienceYears} Years Experience`,
        jdMatch: `${evaluation.matchScore}% Semantic Fit`,
        aiConfidence: evaluation.aiConfidence,
        aiRecommendation: evaluation.aiRecommendation,
        skills: evaluation.matchedSkills,
        partialSkills: evaluation.partialSkills,
        missingSkills: evaluation.missingSkills,
        gaps: evaluation.missingSkills,
        gapPriorities: evaluation.gapPriorities,
        strengths: evaluation.strengths,
        recommendedSkills: evaluation.missingSkills.slice(0, 3),
        roadmapSteps: evaluation.roadmapSteps,
        whyScoreExplanation: evaluation.scoreExplanation,
        courseTitle: 'Actionable Course Pathway',
        courseDesc: evaluation.courseRecommendation,
        fileName: originalFileName,
        fileSize: `${(fileSize / 1024).toFixed(0)} KB`,
      };

      return sendSuccess(res, responseData, 'Resume uploaded and evaluated successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async getUploadHistory(req, res, next) {
    try {
      const resumes = await prisma.resume.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { candidate: true },
      });

      const formatted = resumes.map((r) => ({
        id: r.id,
        fileName: r.originalFileName,
        meta: `${(r.fileSize / 1024).toFixed(0)} KB • ${new Date(r.createdAt).toLocaleDateString()}`,
        status: r.parsingStatus === 'COMPLETED' ? 'Analyzed' : 'Ready',
        statusClass: r.parsingStatus === 'COMPLETED' ? 'analyzed' : 'ready-badge',
        candidateName: r.candidate?.name || 'Applicant',
      }));

      return sendSuccess(res, formatted);
    } catch (err) {
      next(err);
    }
  },
};
