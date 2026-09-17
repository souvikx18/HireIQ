import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

export const analyticsController = {
  async getDashboardOverview(req, res, next) {
    try {
      const [
        totalCandidates,
        totalResumes,
        shortlistedCount,
        totalGaps,
        topCandidateRecord,
        recentCandidatesRecords,
        skillsInDemand,
      ] = await Promise.all([
        prisma.candidate.count(),
        prisma.resume.count(),
        prisma.candidate.count({ where: { status: 'SHORTLISTED' } }),
        prisma.skillGap.count(),
        prisma.candidate.findFirst({
          orderBy: { matchScore: 'desc' },
          include: {
            skills: { include: { skill: true } },
          },
        }),
        prisma.candidate.findMany({
          take: 4,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.skill.findMany({
          take: 5,
          orderBy: { marketDemandPercent: 'desc' },
        }),
      ]);

      // Format top candidate
      let topCandidate = null;
      if (topCandidateRecord) {
        topCandidate = {
          name: topCandidateRecord.name,
          role: topCandidateRecord.roleApplied,
          location: topCandidateRecord.location || 'Bangalore, India',
          experience: '5 Years Exp.',
          available: 'Available',
          matchScore: topCandidateRecord.matchScore || 92,
          skills: topCandidateRecord.skills.map((s) => s.skill.name).slice(0, 5),
        };
      }

      // Format recent candidates
      const recentCandidates = recentCandidatesRecords.map((c) => {
        const initials = c.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: c.id,
          name: c.name,
          avatar: initials,
          role: c.roleApplied,
          matchScore: c.matchScore,
          status: c.status === 'SHORTLISTED' ? 'Shortlisted' : c.status === 'UNDER_REVIEW' ? 'Under Review' : 'Active',
          statusClass: c.status.toLowerCase(),
        };
      });

      // Top skill gaps
      const topSkillGaps = [
        { skill: 'AWS', required: '80%', candidateAvg: '35%', gap: '45%', width: '90%' },
        { skill: 'Docker', required: '70%', candidateAvg: '30%', gap: '40%', width: '80%' },
        { skill: 'Kubernetes', required: '70%', candidateAvg: '25%', gap: '45%', width: '90%' },
        { skill: 'System Design', required: '60%', candidateAvg: '20%', gap: '40%', width: '80%' },
        { skill: 'CI/CD', required: '60%', candidateAvg: '25%', gap: '35%', width: '70%' },
      ];

      return sendSuccess(res, {
        stats: {
          totalCandidates,
          resumesUploaded: totalResumes,
          shortlisted: shortlistedCount,
          skillGapsFound: totalGaps,
          avgApplicationsPerDay: '8.5',
          shortlistRate: totalCandidates > 0 ? `${Math.round((shortlistedCount / totalCandidates) * 100)}%` : '30.5%',
          interviewRate: '18.2%',
        },
        topCandidate,
        recentCandidates,
        topSkillGaps,
        skillsInDemand: skillsInDemand.map((s) => ({
          name: s.name,
          demandPercent: s.marketDemandPercent,
        })),
        gapOverview: {
          totalGaps: 215,
          categories: [
            { name: 'Technical Skills', percentage: '42%', color: 'blue-dot' },
            { name: 'Tools & Frameworks', percentage: '28%', color: 'green-dot' },
            { name: 'Soft Skills', percentage: '18%', color: 'orange-dot' },
            { name: 'Domain Knowledge', percentage: '12%', color: 'red-dot' },
          ],
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getSkillGaps(req, res, next) {
    try {
      const { search, category } = req.query;

      const gaps = [
        {
          id: 'aws',
          skill: 'AWS',
          category: 'tools',
          categoryLabel: 'Tools & Frameworks',
          required: '80%',
          candidateAvg: '35%',
          severityClass: 'high',
          severityLabel: 'High gap',
          severityPercent: '45%',
          iconClass: 'table-icon cloud',
          iconFa: 'fa-brands fa-aws',
        },
        {
          id: 'docker',
          skill: 'Docker',
          category: 'tools',
          categoryLabel: 'Tools & Frameworks',
          required: '70%',
          candidateAvg: '30%',
          severityClass: 'high',
          severityLabel: 'High gap',
          severityPercent: '40%',
          iconClass: 'table-icon docker',
          iconFa: 'fa-brands fa-docker',
        },
        {
          id: 'kubernetes',
          skill: 'Kubernetes',
          category: 'technical',
          categoryLabel: 'Technical Skills',
          required: '70%',
          candidateAvg: '25%',
          severityClass: 'high',
          severityLabel: 'High gap',
          severityPercent: '45%',
          iconClass: 'table-icon kubernetes',
          iconFa: 'fa-solid fa-cubes',
        },
        {
          id: 'system-design',
          skill: 'System Design',
          category: 'technical',
          categoryLabel: 'Technical Skills',
          required: '60%',
          candidateAvg: '20%',
          severityClass: 'medium',
          severityLabel: 'Medium gap',
          severityPercent: '40%',
          iconClass: 'table-icon design',
          iconFa: 'fa-solid fa-diagram-project',
        },
        {
          id: 'industry-knowledge',
          skill: 'Industry Knowledge',
          category: 'domain',
          categoryLabel: 'Domain Knowledge',
          required: '65%',
          candidateAvg: '42%',
          severityClass: 'medium',
          severityLabel: 'Medium gap',
          severityPercent: '23%',
          iconClass: 'table-icon domain',
          iconFa: 'fa-solid fa-briefcase',
        },
      ];

      let filtered = gaps;
      if (search) {
        const s = search.toLowerCase().trim();
        filtered = filtered.filter(
          (g) => g.skill.toLowerCase().includes(s) || g.categoryLabel.toLowerCase().includes(s)
        );
      }
      if (category && category !== 'all') {
        filtered = filtered.filter((g) => g.category === category);
      }

      return sendSuccess(res, {
        readinessScore: 72,
        priorityFocus: [
          { title: 'Cloud & DevOps', subtitle: 'Most frequent gap across roles', percent: '45%' },
          { title: 'System Design', subtitle: 'High impact on senior matches', percent: '40%' },
          { title: 'Communication', subtitle: 'Growing interview signal', percent: '28%' },
        ],
        gaps: filtered,
      });
    } catch (err) {
      next(err);
    }
  },
};
