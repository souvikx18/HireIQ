import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
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
      let rawText = await resumeParserService.extractText(filePath, originalFileName);
      const directTextWordCount = rawText.split(/\s+/).filter(Boolean).length;
      const isScannedOrImage = directTextWordCount < 15;
      let extracted = null;

      if ((!rawText || rawText.length < 40) && config.ai.geminiApiKey) {
        logger.info(`Candidate portal audit: text short or empty (${rawText?.length || 0} chars). Using Gemini AI parser for ${originalFileName}...`);
        const aiParsed = await resumeParserService.parseWithGemini(filePath, originalFileName, fileType);
        if (aiParsed) {
          rawText = aiParsed.fullText || rawText || `Candidate resume: ${originalFileName}`;
          extracted = {
            name: aiParsed.name || originalFileName.replace(/\.[^/.]+$/, ''),
            email: aiParsed.email || req.user?.email || `candidate.${Date.now()}@applicant.hireiq.internal`,
            phone: aiParsed.phone || null,
            experienceYears: String(aiParsed.experienceYears ?? '0+'),
            education: aiParsed.education || null,
            skills: Array.isArray(aiParsed.skills) ? aiParsed.skills : [],
          };
        }
      }

      if (!extracted) {
        extracted = resumeParserService.extractCandidateInfo(rawText, originalFileName);
      } else {
        const detInfo = resumeParserService.extractCandidateInfo(rawText, originalFileName);
        const combined = new Set([...extracted.skills, ...detInfo.skills]);
        extracted.skills = Array.from(combined);
        if (!extracted.education && detInfo.education) {
          extracted.education = detInfo.education;
        }
      }

      // Analyze structure & ATS metrics
      const wordCount = rawText.split(/\s+/).filter(Boolean).length;
      const expNumber = parseFloat(String(extracted.experienceYears)) || 0;
      const hasContact = Boolean(extracted.email && extracted.phone && !extracted.email.includes('hireiq.internal'));
      const hasSkills = extracted.skills && extracted.skills.length >= 3;
      const hasEducation = Boolean(extracted.education && extracted.education !== 'Not specified');
      const hasProjects = /project|booking|website|system|developed|built|created|engineered/i.test(rawText);
      const isFresherOrStudent = expNumber === 0 || /student|b\.?tech|bachelor|fresher|intern/i.test(rawText);
      const hasExperience = expNumber > 0 || (isFresherOrStudent && hasProjects);

      // Detect strong action verbs in bullet points
      const actionVerbsList = [
        'spearheaded', 'architected', 'developed', 'engineered', 'led', 'designed',
        'optimized', 'implemented', 'reduced', 'increased', 'boosted', 'automated',
        'delivered', 'refactored', 'managed', 'created', 'built', 'resolved', 'tested',
      ];
      const foundActionVerbs = actionVerbsList.filter((v) =>
        new RegExp(`\\b${v}\\b`, 'i').test(rawText)
      );

      // Calculate ATS Structural Score (0-100)
      let atsScore = 40;
      if (!isScannedOrImage) {
        atsScore += 20; // Native selectable text layer bonus
      } else {
        atsScore += 5; // AI OCR recovered, but still warned
      }
      if (hasContact) atsScore += 10;
      if (hasSkills) atsScore += 10;
      if (hasEducation) atsScore += 10;
      if (hasExperience) atsScore += 10;
      if (foundActionVerbs.length >= 2) atsScore += 5;
      if (wordCount >= 150 && wordCount <= 1000) atsScore += 5;
      atsScore = Math.min(Math.max(atsScore, 25), 98);

      // Formatting diagnostics
      const formattingChecks = [
        ...(isScannedOrImage
          ? [
              {
                name: 'Document Text Layer (Machine OCR vs. Native Stream)',
                status: 'WARNING',
                detail: `Native text layer missing (only ${directTextWordCount} words readable directly). While HireIQ AI recovered your text via OCR, enterprise ATS systems (Workday, Taleo, Greenhouse) cannot read image scans. Export your resume directly as a standard text PDF or DOCX to prevent automatic parsing rejections.`,
              },
            ]
          : []),
        {
          name: 'Contact Information',
          status: hasContact ? 'PASSED' : (extracted.email ? 'REVIEW' : 'WARNING'),
          detail: hasContact
            ? `Email (${extracted.email}) and phone (${extracted.phone}) verified.`
            : extracted.email
            ? `Email (${extracted.email}) found, but phone number is missing or unformatted.`
            : 'Add a clear phone number and professional email at the top.',
        },
        {
          name: 'Skills Section',
          status: hasSkills ? 'PASSED' : (extracted.skills?.length > 0 ? 'REVIEW' : 'WARNING'),
          detail: hasSkills
            ? `${extracted.skills.length} technical & core competencies identified.`
            : extracted.skills?.length > 0
            ? `Only ${extracted.skills.length} skills detected. Expand your dedicated Skills section with industry-standard technologies.`
            : 'Include a dedicated Skills section with relevant tools, programming languages, and databases.',
        },
        {
          name: 'Work Experience & Projects',
          status: hasExperience ? 'PASSED' : 'REVIEW',
          detail: expNumber > 0
            ? `${expNumber}+ years industry experience detected.`
            : isFresherOrStudent
            ? hasProjects
              ? 'Academic & technical project work identified. Quantify impact with metrics (e.g. users, latency, throughput).'
              : 'Entry-level candidate profile. Add portfolio projects, internships, or open-source contributions.'
            : 'Ensure your work history has clear role titles, organizations, and start/end dates.',
        },
        {
          name: 'Education Section',
          status: hasEducation ? 'PASSED' : 'INFO',
          detail: hasEducation
            ? `Academic credentials identified: ${extracted.education}`
            : 'Specify your highest degree, institution, and graduation year in an Education section.',
        },
        {
          name: 'Action Verbs & Impact',
          status: foundActionVerbs.length >= 2 ? 'PASSED' : 'REVIEW',
          detail: foundActionVerbs.length >= 2
            ? `Strong action verbs found: ${foundActionVerbs.slice(0, 5).join(', ')}.`
            : 'Begin bullet points with strong action verbs (e.g. Developed, Engineered, Optimized, Spearheaded).',
        },
        {
          name: 'Length & Word Count',
          status: wordCount >= 180 && wordCount <= 900 ? 'PASSED' : 'INFO',
          detail: `${wordCount} words detected. Standard single-page ATS benchmark is 250 - 750 words.`,
        },
      ];

      // Missing keywords recommendations for industry standard
      const popularIndustrySkills = [
        'Git & GitHub', 'REST APIs', 'Docker', 'React', 'Node.js', 'PostgreSQL',
        'TypeScript', 'AWS', 'Linux', 'CI/CD', 'MongoDB', 'Redis',
      ];
      const missingRecommendations = popularIndustrySkills.filter(
        (s) => !extracted.skills.some((c) => c.toLowerCase() === s.toLowerCase() || c.toLowerCase().includes(s.toLowerCase()))
      ).slice(0, 5);

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
              ...(req.user.id ? { userId: req.user.id } : {}),
              name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Candidate',
              email: req.user.email,
              roleApplied: 'Job Seeker',
              atsScore,
              experienceYears: expNumber,
              education: extracted.education || null,
              phone: extracted.phone || null,
            },
          });
        } else {
          candidateRecord = await prisma.candidate.update({
            where: { id: candidateRecord.id },
            data: {
              ...(req.user.id ? { userId: req.user.id } : {}),
              atsScore,
              experienceYears: expNumber || candidateRecord.experienceYears || 0,
              education: extracted.education || candidateRecord.education || null,
              phone: extracted.phone || candidateRecord.phone || null,
            },
          });
        }

        // Save resume reference
        const savedResume = await prisma.resume.create({
          data: {
            candidate: { connect: { id: candidateRecord.id } },
            originalFileName,
            storedFileName,
            filePath,
            fileType,
            fileSize,
            parsingStatus: 'COMPLETED',
            rawText,
          },
        });

        // Save resume analysis
        await prisma.resumeAnalysis.create({
          data: {
            resumeId: savedResume.id,
            overallScore: atsScore,
            atsScore,
            skillCoverage: extracted.skills?.length ? Math.min(extracted.skills.length * 10, 100) : 0,
            matchedSkills: JSON.stringify(extracted.skills || []),
            missingSkills: JSON.stringify(missingRecommendations || []),
            partialSkills: JSON.stringify([]),
            strengths: JSON.stringify(foundActionVerbs || []),
            gapRoadmap: JSON.stringify([]),
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
        isScannedOrImage,
        directTextWordCount,
        extractedSkills: extracted.skills,
        missingRecommendations,
        actionVerbsFound: foundActionVerbs,
        formattingChecks,
        experienceYears: extracted.experienceYears,
        education: extracted.education,
        candidateId: candidateRecord?.id || null,
        fileName: originalFileName,
        fileSize,
        rawText,
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
