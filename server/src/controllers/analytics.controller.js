import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

function getPeriodBuckets(period = 'This Month', customDateStr = null) {
  const now = new Date();
  const normalizedPeriod = (period || 'This Month').trim();

  if (normalizedPeriod === 'This Week') {
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const buckets = labels.map((label, index) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() + index);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { label, start, end };
    });

    const rangeStart = monday;
    const rangeEnd = new Date(monday);
    rangeEnd.setDate(monday.getDate() + 6);
    rangeEnd.setHours(23, 59, 59, 999);

    return { period: normalizedPeriod, labels, buckets, rangeStart, rangeEnd, daysCount: 7 };
  }

  if (normalizedPeriod === 'This Month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const rangeStart = new Date(year, month, 1, 0, 0, 0, 0);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const rangeEnd = new Date(year, month, lastDay, 23, 59, 59, 999);

    const labels = [];
    const buckets = [];
    const weekDefs = [
      { start: 1, end: 7, label: 'Week 1' },
      { start: 8, end: 14, label: 'Week 2' },
      { start: 15, end: 21, label: 'Week 3' },
      { start: 22, end: 28, label: 'Week 4' },
    ];
    if (lastDay > 28) {
      weekDefs.push({ start: 29, end: lastDay, label: 'Week 5' });
    }

    weekDefs.forEach((w) => {
      labels.push(w.label);
      buckets.push({
        label: w.label,
        start: new Date(year, month, w.start, 0, 0, 0, 0),
        end: new Date(year, month, w.end, 23, 59, 59, 999),
      });
    });

    return { period: normalizedPeriod, labels, buckets, rangeStart, rangeEnd, daysCount: lastDay };
  }

  if (normalizedPeriod === 'Last Month') {
    const year = now.getFullYear();
    const month = now.getMonth() - 1;
    const targetDate = new Date(year, month, 1);
    const tYear = targetDate.getFullYear();
    const tMonth = targetDate.getMonth();
    const rangeStart = new Date(tYear, tMonth, 1, 0, 0, 0, 0);
    const lastDay = new Date(tYear, tMonth + 1, 0).getDate();
    const rangeEnd = new Date(tYear, tMonth, lastDay, 23, 59, 59, 999);

    const labels = [];
    const buckets = [];
    const weekDefs = [
      { start: 1, end: 7, label: 'Week 1' },
      { start: 8, end: 14, label: 'Week 2' },
      { start: 15, end: 21, label: 'Week 3' },
      { start: 22, end: 28, label: 'Week 4' },
    ];
    if (lastDay > 28) {
      weekDefs.push({ start: 29, end: lastDay, label: 'Week 5' });
    }

    weekDefs.forEach((w) => {
      labels.push(w.label);
      buckets.push({
        label: w.label,
        start: new Date(tYear, tMonth, w.start, 0, 0, 0, 0),
        end: new Date(tYear, tMonth, w.end, 23, 59, 59, 999),
      });
    });

    return { period: normalizedPeriod, labels, buckets, rangeStart, rangeEnd, daysCount: lastDay };
  }

  if (normalizedPeriod === 'Last 3 Months') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets = [];
    const labels = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const lastDay = new Date(y, m + 1, 0).getDate();
      const label = monthNames[m];
      labels.push(label);
      buckets.push({
        label,
        start: new Date(y, m, 1, 0, 0, 0, 0),
        end: new Date(y, m, lastDay, 23, 59, 59, 999),
      });
    }
    const rangeStart = buckets[0].start;
    const rangeEnd = buckets[buckets.length - 1].end;
    const daysCount = Math.max(1, Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)));
    return { period: normalizedPeriod, labels, buckets, rangeStart, rangeEnd, daysCount };
  }

  if (normalizedPeriod === 'This Year') {
    const year = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets = [];
    const labels = [];
    for (let m = 0; m < 12; m++) {
      const lastDay = new Date(year, m + 1, 0).getDate();
      const label = monthNames[m];
      labels.push(label);
      buckets.push({
        label,
        start: new Date(year, m, 1, 0, 0, 0, 0),
        end: new Date(year, m, lastDay, 23, 59, 59, 999),
      });
    }
    const rangeStart = new Date(year, 0, 1, 0, 0, 0, 0);
    const rangeEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    return { period: normalizedPeriod, labels, buckets, rangeStart, rangeEnd, daysCount: 365 };
  }

  // Custom Range / Date
  let baseDate = customDateStr ? new Date(`${customDateStr}T00:00:00`) : new Date(normalizedPeriod);
  if (isNaN(baseDate.getTime())) baseDate = new Date();

  const labels = [];
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(label);
    buckets.push({
      label,
      start: new Date(y, m, day, 0, 0, 0, 0),
      end: new Date(y, m, day, 23, 59, 59, 999),
    });
  }
  const rangeStart = buckets[0].start;
  const rangeEnd = buckets[buckets.length - 1].end;
  return { period: normalizedPeriod, labels, buckets, rangeStart, rangeEnd, daysCount: 7 };
}

export const analyticsController = {
  async getDashboardOverview(req, res, next) {
    try {
      const period = req.query.period || 'This Month';
      const customDate = req.query.customDate;
      const periodInfo = getPeriodBuckets(period, customDate);

      const [
        totalCandidates,
        totalResumes,
        shortlistedCount,
        totalGaps,
        topCandidateRecord,
        recentCandidatesRecords,
        skillsInDemand,
        candidatesInPeriod,
      ] = await Promise.all([
        prisma.candidate.count(),
        prisma.resume.count({ where: { NOT: { storedFileName: { startsWith: 'seed-' } } } }),
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
        prisma.candidate.findMany({
          where: {
            createdAt: {
              gte: periodInfo.rangeStart,
              lte: periodInfo.rangeEnd,
            },
          },
          select: {
            id: true,
            status: true,
            currentStage: true,
            createdAt: true,
          },
        }),
      ]);

      // Calculate time-series buckets
      const appCounts = [];
      const shortlistCounts = [];

      periodInfo.buckets.forEach((b) => {
        const inBucket = candidatesInPeriod.filter((c) => {
          const t = new Date(c.createdAt).getTime();
          return t >= b.start.getTime() && t <= b.end.getTime();
        });
        appCounts.push(inBucket.length);
        shortlistCounts.push(
          inBucket.filter((c) => c.status === 'SHORTLISTED' || c.currentStage === 'SHORTLISTED').length
        );
      });

      const totalAppsInPeriod = candidatesInPeriod.length;
      const totalShortlistedInPeriod = candidatesInPeriod.filter(
        (c) => c.status === 'SHORTLISTED' || c.currentStage === 'SHORTLISTED'
      ).length;
      const totalInterviewInPeriod = candidatesInPeriod.filter(
        (c) => c.currentStage === 'INTERVIEW'
      ).length;

      const periodShortlistRate = totalAppsInPeriod > 0
        ? `${Math.round((totalShortlistedInPeriod / totalAppsInPeriod) * 100)}%`
        : '0%';

      const periodInterviewRate = totalAppsInPeriod > 0
        ? `${Math.round((totalInterviewInPeriod / totalAppsInPeriod) * 100)}%`
        : '0%';

      const avgApplicationsPerDay = periodInfo.daysCount > 0
        ? (totalAppsInPeriod / periodInfo.daysCount).toFixed(1)
        : '0';

      const candidateChart = {
        period: periodInfo.period,
        labels: periodInfo.labels,
        applications: appCounts,
        shortlisted: shortlistCounts,
        totalApplications: totalAppsInPeriod,
        totalShortlisted: totalShortlistedInPeriod,
        shortlistRate: periodShortlistRate,
        interviewRate: periodInterviewRate,
        avgApplicationsPerDay,
      };

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

      // Top skill gaps (dynamically query or empty if none)
      let topSkillGaps = [];
      if (totalGaps > 0) {
        const dbGaps = await prisma.skillGap.findMany({
          take: 5,
          orderBy: { gapPercentage: 'desc' },
          include: { skill: true },
        });
        topSkillGaps = dbGaps.map((g) => ({
          skill: g.skill.name,
          required: `${g.requiredLevel}%`,
          candidateAvg: `${g.candidateLevel}%`,
          gap: `${g.gapPercentage}%`,
          width: `${Math.min(100, g.gapPercentage * 2)}%`,
        }));
      }

      return sendSuccess(res, {
        candidateChart,
        stats: {
          totalCandidates,
          resumesUploaded: totalResumes,
          shortlisted: shortlistedCount,
          skillGapsFound: totalGaps,
          avgApplicationsPerDay,
          shortlistRate: periodShortlistRate,
          interviewRate: periodInterviewRate,
        },
        topCandidate,
        recentCandidates,
        topSkillGaps,
        skillsInDemand: skillsInDemand.map((s) => ({
          name: s.name,
          demandPercent: s.marketDemandPercent,
        })),
        gapOverview: {
          totalGaps,
          categories: [
            { name: 'Technical Skills', percentage: totalGaps > 0 ? '42%' : '0%', color: 'blue-dot' },
            { name: 'Tools & Frameworks', percentage: totalGaps > 0 ? '28%' : '0%', color: 'green-dot' },
            { name: 'Soft Skills', percentage: totalGaps > 0 ? '18%' : '0%', color: 'orange-dot' },
            { name: 'Domain Knowledge', percentage: totalGaps > 0 ? '12%' : '0%', color: 'red-dot' },
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

      // 1. Fetch real candidates with evaluated skills and gaps
      const candidates = await prisma.candidate.findMany({
        include: {
          skills: { include: { skill: true } },
          skillGaps: { include: { skill: true } },
        },
      });

      // 2. Fetch all skills configured with company benchmarks
      const dbSkills = await prisma.skill.findMany({
        orderBy: [
          { isCompanyRequired: 'desc' },
          { requiredBenchmark: 'desc' },
          { name: 'asc' },
        ],
      });

      const getCategoryInfo = (cat) => {
        const c = (cat || 'TECHNICAL').toUpperCase();
        if (c.includes('TOOL')) {
          return {
            key: 'tools',
            label: 'Tools & Frameworks',
            colorClass: 'green',
            trackClass: 'green-track',
            iconClass: 'table-icon cloud',
            iconFa: 'fa-solid fa-screwdriver-wrench',
          };
        }
        if (c.includes('SOFT')) {
          return {
            key: 'soft',
            label: 'Soft Skills',
            colorClass: 'orange',
            trackClass: 'orange-track',
            iconClass: 'table-icon domain',
            iconFa: 'fa-solid fa-people-group',
          };
        }
        if (c.includes('DOMAIN')) {
          return {
            key: 'domain',
            label: 'Domain Knowledge',
            colorClass: 'violet',
            trackClass: 'violet-track',
            iconClass: 'table-icon domain',
            iconFa: 'fa-solid fa-layer-group',
          };
        }
        return {
          key: 'technical',
          label: 'Technical Skills',
          colorClass: 'blue',
          trackClass: '',
          iconClass: 'table-icon design',
          iconFa: 'fa-solid fa-code',
        };
      };

      const getSkillIcon = (name, catInfo) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('aws')) return { iconClass: 'table-icon cloud', iconFa: 'fa-brands fa-aws', focusStyle: 'cloud' };
        if (lower.includes('docker')) return { iconClass: 'table-icon docker', iconFa: 'fa-brands fa-docker', focusStyle: 'cloud' };
        if (lower.includes('kube')) return { iconClass: 'table-icon kubernetes', iconFa: 'fa-solid fa-cubes', focusStyle: 'cloud' };
        if (lower.includes('react')) return { iconClass: 'table-icon react', iconFa: 'fa-brands fa-react', focusStyle: 'design' };
        if (lower.includes('node') || lower.includes('js')) return { iconClass: 'table-icon js', iconFa: 'fa-brands fa-node-js', focusStyle: 'design' };
        if (lower.includes('python')) return { iconClass: 'table-icon python', iconFa: 'fa-brands fa-python', focusStyle: 'design' };
        if (lower.includes('figma')) return { iconClass: 'table-icon design', iconFa: 'fa-brands fa-figma', focusStyle: 'design' };
        if (lower.includes('ci/cd') || lower.includes('cicd')) return { iconClass: 'table-icon cloud', iconFa: 'fa-solid fa-gears', focusStyle: 'cloud' };
        if (lower.includes('system')) return { iconClass: 'table-icon design', iconFa: 'fa-solid fa-diagram-project', focusStyle: 'design' };
        if (lower.includes('communicat')) return { iconClass: 'table-icon domain', iconFa: 'fa-solid fa-comments', focusStyle: 'soft' };
        if (lower.includes('problem')) return { iconClass: 'table-icon domain', iconFa: 'fa-solid fa-lightbulb', focusStyle: 'soft' };
        if (lower.includes('team')) return { iconClass: 'table-icon domain', iconFa: 'fa-solid fa-users', focusStyle: 'soft' };
        return { iconClass: catInfo.iconClass, iconFa: catInfo.iconFa, focusStyle: catInfo.colorClass };
      };

      const candidateCount = candidates.length;

      // 3. Compute real candidate proficiency and gaps for each benchmark skill
      const computedGaps = dbSkills.map((s) => {
        const catInfo = getCategoryInfo(s.category);
        const icon = getSkillIcon(s.name, catInfo);
        const reqBench = s.requiredBenchmark || 70;

        let candAvg = 0;
        if (candidateCount > 0) {
          let totalProficiency = 0;
          candidates.forEach((cand) => {
            // Check if candidate has a specific skillGap record
            const gapRecord = cand.skillGaps?.find(
              (g) => g.skillId === s.id || (g.skill && g.skill.name.toLowerCase() === s.name.toLowerCase())
            );
            if (gapRecord) {
              totalProficiency += gapRecord.candidateLevel;
              return;
            }

            // Check if candidate has candidateSkill record
            const skillRecord = cand.skills?.find(
              (cs) => cs.skillId === s.id || (cs.skill && cs.skill.name.toLowerCase() === s.name.toLowerCase())
            );
            if (skillRecord) {
              const prof = (skillRecord.proficiency || '').toLowerCase();
              if (prof.includes('expert')) totalProficiency += 95;
              else if (prof.includes('proficient')) totalProficiency += 85;
              else if (prof.includes('intermediate')) totalProficiency += 65;
              else if (prof.includes('beginner')) totalProficiency += 40;
              else totalProficiency += 80;
              return;
            }

            // Candidate does not possess this skill
            totalProficiency += 0;
          });

          candAvg = Math.round(totalProficiency / candidateCount);
        }

        const gap = Math.max(0, reqBench - candAvg);

        let severityClass = 'met';
        let severityLabel = 'Benchmark Met';
        let severityPercent = '0%';

        if (gap >= 40) {
          severityClass = 'high';
          severityLabel = 'High gap';
          severityPercent = `${gap}%`;
        } else if (gap >= 20) {
          severityClass = 'medium';
          severityLabel = 'Medium gap';
          severityPercent = `${gap}%`;
        } else if (gap > 0) {
          severityClass = 'low';
          severityLabel = 'Low gap';
          severityPercent = `${gap}%`;
        }

        return {
          id: s.id,
          skill: s.name,
          category: catInfo.key,
          categoryLabel: catInfo.label,
          required: `${reqBench}%`,
          candidateAvg: `${candAvg}%`,
          requiredNum: reqBench,
          candidateAvgNum: candAvg,
          gapNum: gap,
          severityClass,
          severityLabel,
          severityPercent,
          iconClass: icon.iconClass,
          iconFa: icon.iconFa,
          focusStyle: icon.focusStyle,
          isCompanyRequired: s.isCompanyRequired,
          importance: s.importance || 'HIGH',
        };
      });

      // 4. Compute realistic priority focus (top gaps)
      const priorityFocus = candidateCount > 0
        ? [...computedGaps]
            .filter((g) => g.gapNum > 0)
            .sort((a, b) => {
              if (a.isCompanyRequired !== b.isCompanyRequired) return b.isCompanyRequired ? 1 : -1;
              return b.gapNum - a.gapNum;
            })
            .slice(0, 3)
            .map((g) => {
              let subtitle = 'High impact on role benchmark';
              const lower = g.skill.toLowerCase();
              if (lower.includes('aws') || lower.includes('docker') || lower.includes('kube') || lower.includes('ci/cd')) {
                subtitle = 'Most frequent infrastructure shortfall';
              } else if (lower.includes('system') || lower.includes('design')) {
                subtitle = 'Critical for high-scale architectural roles';
              } else if (g.category === 'soft') {
                subtitle = 'Key behavioral & collaboration signal';
              } else if (g.isCompanyRequired) {
                subtitle = 'Mandatory company hiring benchmark';
              }

              return {
                title: g.skill,
                subtitle,
                percent: `${g.gapNum}% gap`,
                iconFa: g.iconFa,
                iconStyle: g.focusStyle,
              };
            })
        : [];

      // 5. Category statistics based on actual candidate data
      const catKeys = [
        { key: 'technical', label: 'Technical Skills', iconClass: 'blue', iconFa: 'fa-solid fa-code', trackClass: '' },
        { key: 'tools', label: 'Tools & Frameworks', iconClass: 'green', iconFa: 'fa-solid fa-screwdriver-wrench', trackClass: 'green-track' },
        { key: 'soft', label: 'Soft Skills', iconClass: 'orange', iconFa: 'fa-solid fa-people-group', trackClass: 'orange-track' },
        { key: 'domain', label: 'Domain Knowledge', iconClass: 'violet', iconFa: 'fa-solid fa-layer-group', trackClass: 'violet-track' },
      ];

      const categories = catKeys.map((ck) => {
        const catSkills = computedGaps.filter((g) => g.category === ck.key);
        const totalSkills = catSkills.length;
        if (totalSkills === 0 || candidateCount === 0) {
          return {
            key: ck.key,
            label: ck.label,
            coverage: 0,
            statusLabel: 'No Data',
            statusClass: 'down',
            detail: totalSkills === 0 ? 'No benchmark skills' : '0% candidate coverage',
            iconClass: ck.iconClass,
            iconFa: ck.iconFa,
            trackClass: ck.trackClass,
          };
        }

        const metCount = catSkills.filter((g) => g.gapNum === 0).length;
        const coverage = totalSkills > 0 ? Math.round((metCount / totalSkills) * 100) : 0;

        let statusLabel = 'Strong';
        let statusClass = 'up';
        if (coverage < 40) {
          statusLabel = 'Attention';
          statusClass = 'down';
        } else if (coverage < 70) {
          statusLabel = 'Needs focus';
          statusClass = 'down';
        }

        return {
          key: ck.key,
          label: ck.label,
          coverage,
          statusLabel,
          statusClass,
          detail: `${metCount} of ${totalSkills} benchmark${totalSkills === 1 ? '' : 's'} met`,
          iconClass: ck.iconClass,
          iconFa: ck.iconFa,
          trackClass: ck.trackClass,
        };
      });

      // 6. Overall workforce readiness
      let readinessScore = 0;
      let readinessHeadline = 'No Candidate Data';
      let readinessDescription = 'Upload candidate resumes to analyze workforce readiness against company benchmarks.';
      let trendText = '0 candidates evaluated';

      if (candidateCount > 0 && computedGaps.length > 0) {
        const totalReq = computedGaps.reduce((acc, g) => acc + g.requiredNum, 0);
        const totalAvg = computedGaps.reduce((acc, g) => acc + g.candidateAvgNum, 0);
        readinessScore = totalReq > 0 ? Math.min(100, Math.round((totalAvg / totalReq) * 100)) : 0;

        if (readinessScore >= 80) {
          readinessHeadline = 'Strong foundation';
        } else if (readinessScore >= 60) {
          readinessHeadline = 'Good foundation';
        } else {
          readinessHeadline = 'Needs targeted upskilling';
        }

        if (priorityFocus.length > 0) {
          const topGapAvg = Math.round(
            priorityFocus.reduce((acc, p) => acc + parseInt(p.percent, 10), 0) / priorityFocus.length
          );
          readinessDescription = `Evaluated across ${candidateCount} candidate${candidateCount === 1 ? '' : 's'}. Closing priority gaps could elevate cohort readiness by ~${topGapAvg}%.`;
        } else {
          readinessDescription = `All evaluated candidates currently meet or exceed core company benchmarks across ${computedGaps.length} monitored skills.`;
        }

        trendText = `${candidateCount} active candidate${candidateCount === 1 ? '' : 's'} evaluated in talent pool`;
      }

      // 7. Filter gaps list based on user search and category query
      let filtered = computedGaps;
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
        readinessScore,
        readinessHeadline,
        readinessDescription,
        trendText,
        candidateCount,
        priorityFocus,
        categories,
        gaps: filtered,
      });
    } catch (err) {
      next(err);
    }
  },
};
