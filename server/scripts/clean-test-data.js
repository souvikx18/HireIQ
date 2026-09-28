import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('=== Cleaning Test Data from Candidate & Recruiter Portals ===');

  // 1. Delete all Candidate Applications
  const deletedApps = await prisma.candidateApplication.deleteMany({});
  console.log(`Deleted ${deletedApps.count} candidate applications.`);

  // 2. Delete all Resume Analyses
  const deletedAnalyses = await prisma.resumeAnalysis.deleteMany({});
  console.log(`Deleted ${deletedAnalyses.count} resume analyses.`);

  // 3. Delete all Resumes from database
  const deletedResumes = await prisma.resume.deleteMany({});
  console.log(`Deleted ${deletedResumes.count} resume records.`);

  // 4. Delete physical uploaded test files in uploads/resumes
  const resumesDir = path.resolve('..', 'uploads', 'resumes');
  if (fs.existsSync(resumesDir)) {
    const files = fs.readdirSync(resumesDir);
    let removedFilesCount = 0;
    for (const file of files) {
      const filePath = path.join(resumesDir, file);
      try {
        fs.unlinkSync(filePath);
        removedFilesCount++;
      } catch (err) {
        console.warn(`Could not remove ${filePath}:`, err.message);
      }
    }
    console.log(`Deleted ${removedFilesCount} physical files from ${resumesDir}.`);
  }

  // 5. Delete all Skill Gaps
  const deletedGaps = await prisma.skillGap.deleteMany({});
  console.log(`Deleted ${deletedGaps.count} skill gap records.`);

  // 6. Delete all Candidate Reviews
  const deletedReviews = await prisma.candidateReview.deleteMany({});
  console.log(`Deleted ${deletedReviews.count} candidate reviews.`);

  // 7. Delete all Candidate Skills
  const deletedCandidateSkills = await prisma.candidateSkill.deleteMany({});
  console.log(`Deleted ${deletedCandidateSkills.count} candidate skills.`);

  // 8. Delete all test candidates except default candidate account
  const deletedCandidates = await prisma.candidate.deleteMany({
    where: {
      email: {
        not: 'candidate@hireiq.com'
      }
    }
  });
  console.log(`Deleted ${deletedCandidates.count} test candidates.`);

  // Reset the default demo candidate profile if it exists
  const candidateUser = await prisma.user.findUnique({
    where: { email: 'candidate@hireiq.com' }
  });

  if (candidateUser) {
    await prisma.candidate.upsert({
      where: { userId: candidateUser.id },
      update: {
        roleApplied: '',
        jobRoleId: null,
        views: 0,
        viewsThisWeek: '0 this week',
        reviewsCount: 0,
        rating: 0,
        status: 'ACTIVE',
        currentStage: 'UPLOADED',
        experienceYears: 0,
        education: null,
        notes: null,
        matchScore: 0,
        atsScore: 0
      },
      create: {
        userId: candidateUser.id,
        name: `${candidateUser.firstName} ${candidateUser.lastName}`,
        email: candidateUser.email,
        roleApplied: '',
        status: 'ACTIVE',
        currentStage: 'UPLOADED',
        experienceYears: 0,
        matchScore: 0,
        atsScore: 0
      }
    });
    console.log('Reset default demo candidate profile for candidate@hireiq.com.');
  }

  // 9. Delete test users (keep only admin@hireiq.com, hrmanager@hireiq.com, candidate@hireiq.com)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ['admin@hireiq.com', 'hrmanager@hireiq.com', 'candidate@hireiq.com']
      }
    }
  });
  console.log(`Deleted ${deletedUsers.count} test user accounts.`);

  // 10. Clean up test AiConversations
  const deletedAiConvs = await prisma.aiConversation.deleteMany({});
  console.log(`Deleted ${deletedAiConvs.count} AI conversation logs.`);

  // 11. Clean up test AuditLogs
  const deletedAuditLogs = await prisma.auditLog.deleteMany({});
  console.log(`Deleted ${deletedAuditLogs.count} audit logs.`);

  // Verification summary
  const summary = {
    remainingUsers: await prisma.user.findMany({ select: { email: true, role: true } }),
    remainingCandidates: await prisma.candidate.findMany({ select: { name: true, email: true } }),
    remainingJobRoles: await prisma.jobRole.count(),
    remainingSkills: await prisma.skill.count(),
    remainingResumes: await prisma.resume.count(),
    remainingApplications: await prisma.candidateApplication.count()
  };
  console.log('Clean State Verification:', JSON.stringify(summary, null, 2));

  await prisma.$disconnect();
}

cleanTestData().catch(err => {
  console.error('Error cleaning test data:', err);
  prisma.$disconnect();
  process.exit(1);
});
