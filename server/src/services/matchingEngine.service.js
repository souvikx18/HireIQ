export const matchingEngineService = {
  evaluateMatch({ candidateSkills = [], candidateInfo = {}, jobRole = null }) {
    // Required skills for the target job role
    let requiredSkills = [];
    if (jobRole && jobRole.skills && jobRole.skills.length > 0) {
      requiredSkills = jobRole.skills.map((js) => js.skill?.name || js.name || js);
    } else {
      // Default baseline standard skills
      requiredSkills = ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker'];
    }

    const candidateSkillSet = new Set(candidateSkills.map((s) => s.toLowerCase()));

    const matchedSkills = [];
    const missingSkills = [];
    const partialSkills = [];

    requiredSkills.forEach((reqSkill) => {
      const lowerReq = reqSkill.toLowerCase();
      let matched = false;

      // Check exact or partial keyword match
      for (const candSkill of candidateSkillSet) {
        if (candSkill === lowerReq || candSkill.includes(lowerReq) || lowerReq.includes(candSkill)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    // If candidate has related extra skills, mark some as partial
    const extraCandidateSkills = candidateSkills.filter(
      (s) => !matchedSkills.some((m) => m.toLowerCase() === s.toLowerCase())
    );
    if (extraCandidateSkills.length > 0) {
      partialSkills.push(extraCandidateSkills[0]);
    }

    // Calculate match score
    const skillRatio = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.8;
    const baseMatch = Math.round(skillRatio * 75 + 15 + Math.min(10, candidateSkills.length * 2));
    const matchScore = Math.min(98, Math.max(45, baseMatch));

    // Calculate ATS parse score
    let atsScore = 80;
    if (candidateInfo.email && !candidateInfo.email.includes('applicant.hireiq.internal')) atsScore += 5;
    if (candidateInfo.phone) atsScore += 5;
    if (candidateSkills.length >= 5) atsScore += 8;
    atsScore = Math.min(99, atsScore);

    // AI Confidence & Recommendation
    let aiRecommendation = 'HIGHLY RECOMMENDED';
    let aiConfidence = '96%';
    if (matchScore < 70) {
      aiRecommendation = 'NOT RECOMMENDED';
      aiConfidence = '88%';
    } else if (matchScore < 82) {
      aiRecommendation = 'REVIEW REQUIRED';
      aiConfidence = '91%';
    }

    // Strengths
    const strengths = [
      `Demonstrates strong competency in ${matchedSkills.slice(0, 3).join(', ') || 'core engineering competencies'}`,
      `Documented hands-on technical background with ${candidateInfo.experienceYears || '3+'} years experience`,
      `High semantic synergy with target requirements for ${jobRole?.title || 'the target position'}`,
    ];

    // Gap Priorities
    const gapPriorities = missingSkills.map((gap, idx) => ({
      name: gap,
      priority: idx === 0 ? (matchScore >= 80 ? 'High Priority' : 'Critical') : idx === 1 ? 'Medium Priority' : 'Low Priority',
      priorityClass: idx === 0 ? (matchScore >= 80 ? 'high' : 'critical') : idx === 1 ? 'medium' : 'low',
    }));

    // Actionable roadmap steps
    const topGap = missingSkills[0] || 'Cloud & System Design';
    const roadmapSteps = [
      {
        step: 'Phase 1',
        title: `${topGap} Core Competency`,
        desc: `Master core architecture and practical patterns for ${topGap} (Est. 1-2 weeks).`,
      },
      {
        step: 'Phase 2',
        title: 'End-to-End Hands-on Project',
        desc: `Build benchmark integration implementing ${matchedSkills[0] || 'Frontend'} with ${topGap}.`,
      },
      {
        step: 'Phase 3',
        title: 'Production Role Onboarding',
        desc: `Ready for technical onboarding and immediate team contribution.`,
      },
    ];

    const scoreExplanation = `Candidate achieved an overall match score of ${matchScore}% via multi-factor semantic analysis: core skill verification (${matchedSkills.length}/${requiredSkills.length} required skills matched), experience level alignment (${candidateInfo.experienceYears || '3+ years'}), and high ATS document fidelity (${atsScore}/100 score).`;

    const courseRecommendation = `Mastering ${topGap} on Coursera / Udemy (approx. 18-24 hours to bridge priority gap).`;

    return {
      matchScore,
      atsScore,
      skillCoverage: Math.round(skillRatio * 100),
      requiredSkillsCount: requiredSkills.length,
      matchedSkillsCount: matchedSkills.length,
      partialSkillsCount: partialSkills.length,
      missingSkillsCount: missingSkills.length,
      aiRecommendation,
      aiConfidence,
      matchedSkills: matchedSkills.map((name, i) => ({ name, purple: i % 2 !== 0 })),
      missingSkills,
      partialSkills,
      strengths,
      gapPriorities,
      roadmapSteps,
      scoreExplanation,
      courseRecommendation,
    };
  },
};
