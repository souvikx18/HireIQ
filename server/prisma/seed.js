import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HireIQ database...');

  // 1. Create Default Users
  const salt = await bcrypt.genSalt(12);
  const adminPassword = await bcrypt.hash('Admin@123456', salt);
  const hrPassword = await bcrypt.hash('Manager@123456', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hireiq.com' },
    update: {},
    create: {
      email: 'admin@hireiq.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      avatarUrl: null,
      emailNotifications: true,
      hiringUpdates: true,
      candidateUpdates: true,
      interviewReminders: true,
    },
  });

  const hrManager = await prisma.user.upsert({
    where: { email: 'hrmanager@hireiq.com' },
    update: {},
    create: {
      email: 'hrmanager@hireiq.com',
      passwordHash: hrPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR_MANAGER',
      avatarUrl: null,
      emailNotifications: true,
      hiringUpdates: true,
      candidateUpdates: true,
      interviewReminders: true,
    },
  });

  console.log(`Created default users: ${admin.email}, ${hrManager.email}`);

  // 2. Create In-Demand Skills Catalog
  const skillsData = [
    { name: 'JavaScript', category: 'TECHNICAL', marketDemandPercent: 80 },
    { name: 'Python', category: 'TECHNICAL', marketDemandPercent: 70 },
    { name: 'SQL', category: 'TECHNICAL', marketDemandPercent: 65 },
    { name: 'React', category: 'TECHNICAL', marketDemandPercent: 60 },
    { name: 'Java', category: 'TECHNICAL', marketDemandPercent: 50 },
    { name: 'Node.js', category: 'TECHNICAL', marketDemandPercent: 68 },
    { name: 'AWS', category: 'TOOLS', marketDemandPercent: 75 },
    { name: 'Docker', category: 'TOOLS', marketDemandPercent: 65 },
    { name: 'Kubernetes', category: 'TECHNICAL', marketDemandPercent: 60 },
    { name: 'System Design', category: 'TECHNICAL', marketDemandPercent: 55 },
    { name: 'Figma', category: 'TOOLS', marketDemandPercent: 50 },
    { name: 'CI/CD', category: 'TOOLS', marketDemandPercent: 60 },
    { name: 'Communication', category: 'SOFT', marketDemandPercent: 85 },
    { name: 'Problem Solving', category: 'SOFT', marketDemandPercent: 90 },
    { name: 'Teamwork', category: 'SOFT', marketDemandPercent: 80 },
    { name: 'Industry Knowledge', category: 'DOMAIN', marketDemandPercent: 65 },
  ];

  const skillMap = {};
  for (const s of skillsData) {
    const record = await prisma.skill.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
    skillMap[s.name] = record;
  }
  console.log(`Seeded ${Object.keys(skillMap).length} skills.`);

  // 3. Create Default Job Roles
  const rolesData = [
    {
      code: 'FS-001',
      title: 'Full Stack Developer',
      department: 'Engineering',
      experienceLevel: '2 - 5 years',
      openPositions: 3,
      status: 'ACTIVE',
      skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Docker'],
    },
    {
      code: 'DA-002',
      title: 'Data Analyst',
      department: 'Data Science',
      experienceLevel: '1 - 3 years',
      openPositions: 2,
      status: 'ACTIVE',
      skills: ['SQL', 'Python'],
    },
    {
      code: 'UX-003',
      title: 'UI/UX Designer',
      department: 'Design',
      experienceLevel: '2 - 5 years',
      openPositions: 1,
      status: 'ACTIVE',
      skills: ['Figma', 'System Design'],
    },
    {
      code: 'DO-004',
      title: 'DevOps Engineer',
      department: 'Engineering',
      experienceLevel: '3 - 6 years',
      openPositions: 2,
      status: 'ACTIVE',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    },
    {
      code: 'CS-005',
      title: 'Cyber Security Analyst',
      department: 'Security',
      experienceLevel: '2 - 5 years',
      openPositions: 1,
      status: 'ACTIVE',
      skills: ['System Design', 'Python'],
    },
    {
      code: 'PM-007',
      title: 'Product Manager',
      department: 'Product',
      experienceLevel: '4 - 7 years',
      openPositions: 1,
      status: 'ACTIVE',
      skills: ['Communication', 'Industry Knowledge', 'System Design'],
    },
  ];

  const roleMap = {};
  for (const r of rolesData) {
    const roleRecord = await prisma.jobRole.upsert({
      where: { code: r.code },
      update: {
        title: r.title,
        department: r.department,
        experienceLevel: r.experienceLevel,
        openPositions: r.openPositions,
        status: r.status,
      },
      create: {
        code: r.code,
        title: r.title,
        department: r.department,
        experienceLevel: r.experienceLevel,
        openPositions: r.openPositions,
        status: r.status,
      },
    });
    roleMap[r.code] = roleRecord;

    // Link skills
    for (const sk of r.skills) {
      if (skillMap[sk]) {
        await prisma.jobSkill.upsert({
          where: {
            jobRoleId_skillId: {
              jobRoleId: roleRecord.id,
              skillId: skillMap[sk].id,
            },
          },
          update: {},
          create: {
            jobRoleId: roleRecord.id,
            skillId: skillMap[sk].id,
            required: true,
          },
        });
      }
    }
  }
  console.log(`Seeded ${Object.keys(roleMap).length} job roles.`);

  // 4. Create Initial Candidates
  const candidatesData = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@email.com',
      roleApplied: 'Frontend Engineer',
      jobRoleCode: 'FS-001',
      matchScore: 92,
      atsScore: 95,
      views: 32,
      viewsThisWeek: '5 this week',
      reviewsCount: 18,
      rating: 4.6,
      status: 'SHORTLISTED',
      skills: ['React', 'JavaScript', 'SQL', 'Docker'],
      review: {
        authorName: 'John Doe',
        text: 'Exceptional problem solving skills, high semantic code alignment.',
        rating: 4.8,
        date: 'May 24, 2025',
        reviewClass: 'green-review',
      },
      gaps: [
        { skill: 'AWS', required: 80, candidate: 35, gap: 45, priority: 'HIGH' },
      ],
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@email.com',
      roleApplied: 'Full Stack Developer',
      jobRoleCode: 'FS-001',
      matchScore: 85,
      atsScore: 88,
      views: 28,
      viewsThisWeek: '4 this week',
      reviewsCount: 15,
      rating: 4.2,
      status: 'ACTIVE',
      skills: ['Node.js', 'React', 'Docker', 'SQL'],
      review: {
        authorName: 'Emily Johnson',
        text: 'Good technical knowledge, can improve in system design.',
        rating: 4.2,
        date: 'May 23, 2025',
        reviewClass: 'blue-review',
      },
      gaps: [
        { skill: 'Kubernetes', required: 70, candidate: 25, gap: 45, priority: 'HIGH' },
      ],
    },
    {
      name: 'Ananya Patel',
      email: 'ananya.patel@email.com',
      roleApplied: 'Backend Developer',
      jobRoleCode: 'FS-001',
      matchScore: 88,
      atsScore: 91,
      views: 25,
      viewsThisWeek: '3 this week',
      reviewsCount: 12,
      rating: 4.0,
      status: 'SHORTLISTED',
      skills: ['Python', 'SQL', 'Docker', 'Node.js'],
      review: {
        authorName: 'Michael Smith',
        text: 'Strong backend concepts, fast API integration.',
        rating: 4.5,
        date: 'May 22, 2025',
        reviewClass: 'yellow-review',
      },
      gaps: [
        { skill: 'System Design', required: 60, candidate: 20, gap: 40, priority: 'MEDIUM' },
      ],
    },
    {
      name: 'Vikram Kumar',
      email: 'vikram.kumar@email.com',
      roleApplied: 'Frontend Engineer',
      jobRoleCode: 'FS-001',
      matchScore: 74,
      atsScore: 79,
      views: 20,
      viewsThisWeek: '2 this week',
      reviewsCount: 9,
      rating: 3.8,
      status: 'UNDER_REVIEW',
      skills: ['JavaScript', 'HTML', 'CSS'],
      review: {
        authorName: 'John Doe',
        text: 'Needs improvement in advanced JavaScript frameworks and TypeScript.',
        rating: 3.5,
        date: 'May 21, 2025',
        reviewClass: 'red-review',
      },
      gaps: [
        { skill: 'Docker', required: 70, candidate: 30, gap: 40, priority: 'HIGH' },
      ],
    },
    {
      name: 'Neha Tiwari',
      email: 'neha.tiwari@email.com',
      roleApplied: 'UI/UX Designer',
      jobRoleCode: 'UX-003',
      matchScore: 89,
      atsScore: 92,
      views: 18,
      viewsThisWeek: '2 this week',
      reviewsCount: 8,
      rating: 4.4,
      status: 'ACTIVE',
      skills: ['Figma', 'System Design'],
      review: {
        authorName: 'Emily Johnson',
        text: 'Creative designs, exceptional understanding of UI/UX design systems.',
        rating: 4.6,
        date: 'May 21, 2025',
        reviewClass: 'green-review',
      },
      gaps: [
        { skill: 'Industry Knowledge', required: 65, candidate: 42, gap: 23, priority: 'LOW' },
      ],
    },
  ];

  for (const c of candidatesData) {
    const jobRole = roleMap[c.jobRoleCode];
    const candidate = await prisma.candidate.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        roleApplied: c.roleApplied,
        jobRoleId: jobRole?.id || null,
        matchScore: c.matchScore,
        atsScore: c.atsScore,
        views: c.views,
        viewsThisWeek: c.viewsThisWeek,
        reviewsCount: c.reviewsCount,
        rating: c.rating,
        status: c.status,
      },
      create: {
        name: c.name,
        email: c.email,
        roleApplied: c.roleApplied,
        jobRoleId: jobRole?.id || null,
        matchScore: c.matchScore,
        atsScore: c.atsScore,
        views: c.views,
        viewsThisWeek: c.viewsThisWeek,
        reviewsCount: c.reviewsCount,
        rating: c.rating,
        status: c.status,
      },
    });

    // Link skills
    for (const skName of c.skills) {
      if (skillMap[skName]) {
        await prisma.candidateSkill.upsert({
          where: {
            candidateId_skillId: {
              candidateId: candidate.id,
              skillId: skillMap[skName].id,
            },
          },
          update: {},
          create: {
            candidateId: candidate.id,
            skillId: skillMap[skName].id,
            proficiency: 'Proficient',
          },
        });
      }
    }

    // Link gaps
    for (const g of c.gaps) {
      if (skillMap[g.skill]) {
        await prisma.skillGap.create({
          data: {
            candidateId: candidate.id,
            skillId: skillMap[g.skill].id,
            requiredLevel: g.required,
            candidateLevel: g.candidate,
            gapPercentage: g.gap,
            priority: g.priority,
            learningPlan: `Structured course pathway for ${g.skill}`,
          },
        });
      }
    }

    // Add review
    if (c.review) {
      await prisma.candidateReview.create({
        data: {
          candidateId: candidate.id,
          reviewerName: c.review.authorName,
          reviewText: c.review.text,
          rating: c.review.rating,
          reviewDate: c.review.date,
          reviewClass: c.review.reviewClass,
        },
      });
    }

    // Add Resume record with mock analysis
    const resume = await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        originalFileName: `${c.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
        storedFileName: `seed-${candidate.id}.pdf`,
        filePath: `uploads/resumes/seed-${candidate.id}.pdf`,
        fileType: 'application/pdf',
        fileSize: 245760,
        parsingStatus: 'COMPLETED',
        rawText: `Candidate ${c.name} - Applied for ${c.roleApplied}. Skills: ${c.skills.join(', ')}`,
      },
    });

    await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        overallScore: c.matchScore,
        atsScore: c.atsScore,
        skillCoverage: Math.round((c.skills.length / 5) * 100),
        aiRecommendation: c.matchScore >= 85 ? 'HIGHLY RECOMMENDED' : 'REVIEW REQUIRED',
        aiConfidence: '95%',
        matchedSkills: JSON.stringify(c.skills.map((s, idx) => ({ name: s, purple: idx % 2 !== 0 }))),
        missingSkills: JSON.stringify(c.gaps.map((g) => g.skill)),
        partialSkills: JSON.stringify([]),
        strengths: JSON.stringify([
          `Solid command of ${c.skills.slice(0, 2).join(' & ')}`,
          'Strong problem solving and architectural foundations',
        ]),
        gapRoadmap: JSON.stringify([
          { step: 'Phase 1', title: `${c.gaps[0]?.skill || 'Core'} Fundamentals`, desc: '1-2 weeks foundational study' },
          { step: 'Phase 2', title: 'Hands-on Implementation', desc: 'Deploy practical demo architecture' },
        ]),
        scoreExplanation: `${c.name} achieved an overall match score of ${c.matchScore}%.`,
        courseRecommendation: `Actionable courses available to fill priority gaps.`,
      },
    });
  }

  console.log(`Seeded ${candidatesData.length} candidates with reviews, skills, and resume analyses.`);
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
