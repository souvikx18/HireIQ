import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HireIQ database...');

  // 1. Create Default Users
  const salt = await bcrypt.genSalt(12);
  const adminPassword = await bcrypt.hash('Admin@123456', salt);
  const hrPassword = await bcrypt.hash('Manager@123456', salt);
  const candidatePassword = await bcrypt.hash('Candidate@123456', salt);

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

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@hireiq.com' },
    update: {
      passwordHash: candidatePassword,
      role: 'CANDIDATE',
    },
    create: {
      email: 'candidate@hireiq.com',
      passwordHash: candidatePassword,
      firstName: 'Surja Kanta',
      lastName: 'Chowdhury',
      role: 'CANDIDATE',
      avatarUrl: null,
      emailNotifications: true,
      hiringUpdates: true,
      candidateUpdates: true,
      interviewReminders: true,
    },
  });

  console.log(`Created default users: ${admin.email}, ${hrManager.email}, ${candidate.email}`);

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

  // Candidates will be populated purely by actual user uploads and additions
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
