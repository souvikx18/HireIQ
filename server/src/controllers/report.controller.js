import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

function getDateRangeBounds(dateRange) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);

  const normalized = (dateRange || '').toLowerCase();

  if (normalized.includes('7') || normalized.includes('week')) {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
  } else if (normalized.includes('this month')) {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  } else if (normalized.includes('90')) {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90, 0, 0, 0, 0);
  } else if (normalized.includes('quarter')) {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const prevQuarter = (currentQuarter + 3) % 4;
    const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
    start = new Date(year, prevQuarter * 3, 1, 0, 0, 0, 0);
    const endQuarterDate = new Date(year, (prevQuarter + 1) * 3, 0, 23, 59, 59, 999);
    return { start, end: endQuarterDate, label: dateRange };
  } else if (normalized.includes('year') || normalized.includes('ytd')) {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (normalized.includes('all')) {
    start = new Date(2020, 0, 1, 0, 0, 0, 0);
  } else {
    // Default: Last 30 Days
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
  }

  return { start, end: today, label: dateRange };
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const reportController = {
  async generateReport(req, res, next) {
    try {
      const { reportName = 'Candidate Summary Report', dateRange = 'Last 30 Days' } = req.body;
      const bounds = getDateRangeBounds(dateRange);

      // 1. Fetch real candidates created within the date range
      const candidates = await prisma.candidate.findMany({
        where: {
          createdAt: {
            gte: bounds.start,
            lte: bounds.end,
          },
        },
        include: {
          jobRole: true,
          skills: { include: { skill: true } },
          resumes: { include: { analysis: true } },
          reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      });

      // 2. Fetch real resumes uploaded within the date range
      const resumes = await prisma.resume.findMany({
        where: {
          createdAt: {
            gte: bounds.start,
            lte: bounds.end,
          },
          NOT: {
            storedFileName: { startsWith: 'seed-' },
          },
        },
        include: {
          candidate: true,
          analysis: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // 3. Fetch all active organizational job roles
      const jobRoles = await prisma.jobRole.findMany({
        include: {
          _count: {
            select: {
              candidates: {
                where: {
                  NOT: [
                    { status: 'REJECTED' },
                    { currentStage: 'REJECTED' },
                  ],
                },
              },
            },
          },
        },
        orderBy: { title: 'asc' },
      });

      // Compute core metrics strictly from real data
      const totalCandidates = candidates.length;
      const totalResumes = resumes.length;

      const shortlistedCount = candidates.filter(
        (c) => c.status === 'SHORTLISTED' || c.currentStage === 'SHORTLISTED'
      ).length;
      const interviewCount = candidates.filter(
        (c) => c.currentStage === 'INTERVIEW'
      ).length;
      const selectedCount = candidates.filter(
        (c) => c.currentStage === 'SELECTED' || c.status === 'HIRED'
      ).length;
      const rejectedCount = candidates.filter(
        (c) => c.status === 'REJECTED' || c.currentStage === 'REJECTED'
      ).length;
      const activeInPipeline = candidates.filter(
        (c) => c.status !== 'REJECTED' && c.currentStage !== 'REJECTED'
      ).length;

      const avgMatch = totalCandidates > 0
        ? Math.round(candidates.reduce((acc, c) => acc + (c.matchScore || 0), 0) / totalCandidates)
        : 0;

      const avgAts = totalCandidates > 0
        ? Math.round(candidates.reduce((acc, c) => acc + (c.atsScore || 0), 0) / totalCandidates)
        : 0;

      const totalOpenPositions = jobRoles.reduce(
        (acc, r) => acc + (parseInt(r.openPositions, 10) || 0),
        0
      );

      const generatedAt = formatDateTime(new Date());
      const userName = req.user?.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`.trim()
        : 'Administrator';
      const userEmail = req.user?.email || 'admin@hireiq.com';

      // Report Header Banner
      let content = '================================================================================\n';
      content += '                        HIREIQ RECRUITMENT INTELLIGENCE                         \n';
      content += `                        REPORT: ${reportName.toUpperCase()}                     \n`;
      content += '================================================================================\n';
      content += `Generated On:      ${generatedAt}\n`;
      content += `Reporting Window:  ${dateRange} (${formatDate(bounds.start)} - ${formatDate(bounds.end)})\n`;
      content += `Generated By:      ${userName} <${userEmail}>\n`;
      content += `Data Source:       Production Database (Real-time Records)\n`;
      content += '--------------------------------------------------------------------------------\n\n';

      // Build specific report sections based on report type
      if (reportName.includes('Candidate Summary')) {
        content += '1. EXECUTIVE SUMMARY\n';
        content += '--------------------------------------------------------------------------------\n';
        content += `Total Candidate Applications:    ${totalCandidates}\n`;
        content += `Active Pipeline Candidates:      ${activeInPipeline}\n`;
        content += `Shortlisted Talent:              ${shortlistedCount}\n`;
        content += `Interview Rounds:                ${interviewCount}\n`;
        content += `Selected / Hired:                ${selectedCount}\n`;
        content += `Rejected / Archived:             ${rejectedCount}\n`;
        content += `Average Applicant Match Score:   ${avgMatch}%\n`;
        content += `Average ATS Compliance Score:    ${avgAts}%\n\n`;

        content += '2. CANDIDATE ROSTER DETAILS\n';
        content += '--------------------------------------------------------------------------------\n';
        if (totalCandidates === 0) {
          content += `No candidate applications recorded in the database for ${dateRange}.\n\n`;
        } else {
          content += 'NAME                    | ROLE APPLIED           | STAGE        | MATCH | ATS | EXP\n';
          content += '------------------------+------------------------+--------------+-------+-----+----\n';
          candidates.forEach((c) => {
            const name = (c.name || 'Unknown').padEnd(23).slice(0, 23);
            const role = (c.roleApplied || 'Unassigned').padEnd(23).slice(0, 23);
            const stage = (c.currentStage || 'UNDER_REVIEW').padEnd(13).slice(0, 13);
            const match = `${c.matchScore || 0}%`.padEnd(6);
            const ats = `${c.atsScore || 0}%`.padEnd(4);
            const exp = `${c.experienceYears || 0}y`;
            content += `${name} | ${role} | ${stage} | ${match} | ${ats} | ${exp}\n`;
          });
          content += '\n';

          // Skill summary across these candidates
          const skillMap = {};
          candidates.forEach((c) => {
            c.skills.forEach((cs) => {
              const sName = cs.skill?.name || 'Unknown';
              skillMap[sName] = (skillMap[sName] || 0) + 1;
            });
          });
          const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]);

          content += '3. VERIFIED SKILLS IN CANDIDATE POOL\n';
          content += '--------------------------------------------------------------------------------\n';
          if (topSkills.length === 0) {
            content += 'No verified skills extracted for candidates in this date range.\n\n';
          } else {
            topSkills.slice(0, 12).forEach(([sk, count]) => {
              const pct = Math.round((count / totalCandidates) * 100);
              content += `- ${sk.padEnd(22)} : ${count} candidate(s) (${pct}% cohort coverage)\n`;
            });
            content += '\n';
          }
        }
      } else if (reportName.includes('Hiring Performance')) {
        content += '1. HIRING VELOCITY & VOLUME AUDIT\n';
        content += '--------------------------------------------------------------------------------\n';
        content += `Total Applications Received:     ${totalCandidates}\n`;
        content += `Total Resumes Ingested:          ${totalResumes}\n`;
        content += `Qualified Shortlists:            ${shortlistedCount}\n`;
        content += `Interview Velocity:              ${interviewCount} candidate(s)\n`;
        content += `Offers / Selected:               ${selectedCount} candidate(s)\n`;
        content += `Shortlist Conversion Rate:       ${totalCandidates > 0 ? Math.round((shortlistedCount / totalCandidates) * 100) : 0}%\n`;
        content += `Average Match Score:             ${avgMatch}%\n`;
        content += `Average ATS Compliance:          ${avgAts}%\n\n`;

        content += '2. ORGANIZATIONAL ROLE COVERAGE\n';
        content += '--------------------------------------------------------------------------------\n';
        content += `Total Open Positions:            ${totalOpenPositions} positions to fill across ${jobRoles.length} roles\n\n`;
        content += 'JOB ROLE TITLE          | DEPT        | OPEN | ACTIVE APPLICANTS | STATUS\n';
        content += '------------------------+-------------+------+-------------------+--------\n';
        jobRoles.forEach((jr) => {
          const title = jr.title.padEnd(23).slice(0, 23);
          const dept = (jr.department || 'General').padEnd(12).slice(0, 12);
          const open = String(jr.openPositions || 1).padEnd(5);
          const active = String(jr._count.candidates || 0).padEnd(18);
          const status = jr.status === 'ACTIVE' ? 'Hiring' : 'Paused';
          content += `${title} | ${dept} | ${open} | ${active} | ${status}\n`;
        });
        content += '\n';
      } else if (reportName.includes('Interview Funnel')) {
        content += '1. RECRUITMENT PIPELINE FUNNEL CONVERSION\n';
        content += '--------------------------------------------------------------------------------\n';
        if (totalCandidates === 0) {
          content += `No applicant activity recorded during ${dateRange}.\n\n`;
        } else {
          const uploadedCount = candidates.filter((c) => c.currentStage === 'UPLOADED').length;
          const parsedCount = candidates.filter((c) => c.currentStage === 'PARSED').length;
          const underReviewCount = candidates.filter((c) => c.currentStage === 'UNDER_REVIEW').length;

          content += `Stage 1: Inflow / Uploaded     -> ${uploadedCount} candidate(s) (${Math.round((uploadedCount / totalCandidates) * 100)}%)\n`;
          content += `Stage 2: Parsed & Evaluated    -> ${parsedCount} candidate(s) (${Math.round((parsedCount / totalCandidates) * 100)}%)\n`;
          content += `Stage 3: Under Review          -> ${underReviewCount} candidate(s) (${Math.round((underReviewCount / totalCandidates) * 100)}%)\n`;
          content += `Stage 4: Shortlisted           -> ${shortlistedCount} candidate(s) (${Math.round((shortlistedCount / totalCandidates) * 100)}%)\n`;
          content += `Stage 5: Interview             -> ${interviewCount} candidate(s) (${Math.round((interviewCount / totalCandidates) * 100)}%)\n`;
          content += `Stage 6: Selected / Hired      -> ${selectedCount} candidate(s) (${Math.round((selectedCount / totalCandidates) * 100)}%)\n`;
          content += `Stage 7: Rejected / Archived   -> ${rejectedCount} candidate(s) (${Math.round((rejectedCount / totalCandidates) * 100)}%)\n\n`;

          content += '2. FUNNEL DROP-OFF ANALYSIS\n';
          content += '--------------------------------------------------------------------------------\n';
          content += `Overall Pipeline Retention:      ${totalCandidates > 0 ? Math.round((activeInPipeline / totalCandidates) * 100) : 0}%\n`;
          content += `Overall Pipeline Drop-off:       ${totalCandidates > 0 ? Math.round((rejectedCount / totalCandidates) * 100) : 0}%\n\n`;
        }
      } else if (reportName.includes('Source Effectiveness')) {
        content += '1. CANDIDATE INGESTION CHANNELS\n';
        content += '--------------------------------------------------------------------------------\n';
        if (totalCandidates === 0 && totalResumes === 0) {
          content += `No candidate sources recorded during ${dateRange}.\n\n`;
        } else {
          const directResumeCount = resumes.length;
          const candidateAppCount = candidates.length;
          const totalIngestion = directResumeCount + Math.max(0, candidateAppCount - directResumeCount);

          const resumePct = totalIngestion > 0 ? Math.round((directResumeCount / totalIngestion) * 100) : 100;
          const manualPct = 100 - resumePct;

          content += `Direct Resume Ingestion & Parsing : ${directResumeCount} (${resumePct}%)\n`;
          content += `Direct Recruitment Portal Intake : ${Math.max(0, candidateAppCount - directResumeCount)} (${manualPct}%)\n\n`;

          content += '2. INGESTED RESUME AUDIT LOG\n';
          content += '--------------------------------------------------------------------------------\n';
          if (resumes.length === 0) {
            content += 'No resume files uploaded during this period.\n\n';
          } else {
            content += 'FILE NAME                               | SIZE     | CANDIDATE LINKED        | UPLOADED\n';
            content += '----------------------------------------+----------+-------------------------+-------------\n';
            resumes.forEach((r) => {
              const fname = (r.originalFileName || 'resume.pdf').padEnd(39).slice(0, 39);
              const size = `${(r.fileSize / 1024).toFixed(0)} KB`.padEnd(9);
              const candName = (r.candidate?.name || 'Unlinked').padEnd(24).slice(0, 24);
              const uploaded = formatDate(r.createdAt);
              content += `${fname} | ${size} | ${candName} | ${uploaded}\n`;
            });
            content += '\n';
          }
        }
      } else {
        // Master Comprehensive Hiring Report (aggregated)
        content += '1. MASTER EXECUTIVE BRIEFING\n';
        content += '--------------------------------------------------------------------------------\n';
        content += `Reporting Window:                ${dateRange}\n`;
        content += `Total Candidate Inflow:          ${totalCandidates}\n`;
        content += `Active Pipeline Candidates:      ${activeInPipeline}\n`;
        content += `Shortlisted Talent:              ${shortlistedCount}\n`;
        content += `Interviews in Progress:          ${interviewCount}\n`;
        content += `Hired / Selected:                ${selectedCount}\n`;
        content += `Rejected / Archived:             ${rejectedCount}\n`;
        content += `Average Applicant Match Score:   ${avgMatch}%\n`;
        content += `Average ATS Compliance Score:    ${avgAts}%\n`;
        content += `Total Open Positions:            ${totalOpenPositions} across ${jobRoles.length} roles\n\n`;

        content += '2. ACTIVE CANDIDATE ROSTER\n';
        content += '--------------------------------------------------------------------------------\n';
        if (totalCandidates === 0) {
          content += `No applicant activity recorded during ${dateRange}.\n\n`;
        } else {
          content += 'NAME                    | ROLE APPLIED           | STAGE        | MATCH | ATS | EXP\n';
          content += '------------------------+------------------------+--------------+-------+-----+----\n';
          candidates.forEach((c) => {
            const name = (c.name || 'Unknown').padEnd(23).slice(0, 23);
            const role = (c.roleApplied || 'Unassigned').padEnd(23).slice(0, 23);
            const stage = (c.currentStage || 'UNDER_REVIEW').padEnd(13).slice(0, 13);
            const match = `${c.matchScore || 0}%`.padEnd(6);
            const ats = `${c.atsScore || 0}%`.padEnd(4);
            const exp = `${c.experienceYears || 0}y`;
            content += `${name} | ${role} | ${stage} | ${match} | ${ats} | ${exp}\n`;
          });
          content += '\n';
        }
      }

      content += '================================================================================\n';
      content += 'HireIQ Enterprise Platform - Confidential Hiring Telemetry\n';
      content += 'Generated automatically via HireIQ Intelligence Engine\n';

      const fileName = `${reportName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dateRange.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;

      return sendSuccess(res, {
        reportName,
        dateRange,
        fileName,
        content,
      });
    } catch (err) {
      next(err);
    }
  },
};
