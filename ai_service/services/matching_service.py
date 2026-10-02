import re
from typing import List, Optional
from ai_service.schemas.resume import JobMatchResponse
from ai_service.services.analyzer_service import analyzer_service, ALL_KNOWN_SKILLS
from ai_service.services.gemini_service import gemini_service
from ai_service.core.logging import logger


class JobMatchingService:
    """Computes semantic alignment between candidate resumes and job role requirements."""

    @classmethod
    def match(
        cls,
        resume_text: str,
        job_description: str,
        job_title: Optional[str] = "Target Role",
        required_skills: Optional[List[str]] = None,
    ) -> JobMatchResponse:
        # Extract skills present in the resume and the job description
        resume_skills = set(analyzer_service.extract_skills_heuristically(resume_text))

        # Determine target skills from parameters or extract from job description
        jd_skills = set(required_skills or [])
        if not jd_skills:
            jd_skills = set(analyzer_service.extract_skills_heuristically(job_description))

        if not jd_skills:
            # Fallback benchmark
            jd_skills = {"Communication", "Problem Solving", "Collaboration"}

        matched = list(resume_skills.intersection(jd_skills))
        missing = list(jd_skills.difference(resume_skills))

        skill_coverage = round((len(matched) / max(1, len(jd_skills))) * 100, 1)

        # Keyword density & context matching
        text_match_points = 0
        jd_words = [w.lower() for w in re.findall(r"\b\w{4,}\b", job_description)]
        resume_words = set(w.lower() for w in re.findall(r"\b\w{4,}\b", resume_text))
        if jd_words:
            overlap = sum(1 for w in jd_words if w in resume_words)
            text_match_points = min(30, int((overlap / len(jd_words)) * 60))

        calculated_score = int((skill_coverage * 0.7) + text_match_points)
        calculated_score = max(20, min(98, calculated_score))

        # Check Gemini enhancement if available
        if gemini_service.is_available:
            prompt = (
                f"Compare this resume to the job description:\n\n"
                f"JOB TITLE: {job_title}\n"
                f"JOB DESCRIPTION:\n{job_description[:4000]}\n\n"
                f"RESUME:\n{resume_text[:4000]}\n\n"
                f"Output strictly JSON with keys:\n"
                f"- match_score: integer 0-100\n"
                f"- verdict: string ('Strong Fit' | 'Potential Fit' | 'Not a Fit')\n"
                f"- explanation: concise string explaining strengths and gaps"
            )
            ai_data = gemini_service.generate_json_response(prompt)
            if ai_data and "match_score" in ai_data:
                calculated_score = int(ai_data["match_score"])
                verdict = ai_data.get("verdict", "Potential Fit")
                explanation = ai_data.get("explanation", "")
                return JobMatchResponse(
                    match_score=calculated_score,
                    ats_score=max(45, calculated_score - 5),
                    skill_coverage=skill_coverage,
                    matched_skills=matched,
                    missing_skills=missing,
                    verdict=verdict,
                    explanation=explanation,
                )

        if calculated_score >= 80:
            verdict = "Strong Fit"
            explanation = f"Candidate covers {skill_coverage}% of target skills ({len(matched)} matched) with strong alignment for {job_title}."
        elif calculated_score >= 55:
            verdict = "Potential Fit"
            explanation = f"Moderate fit with {skill_coverage}% skill coverage. Missing key competencies: {', '.join(missing[:3]) if missing else 'None'}."
        else:
            verdict = "Not a Fit"
            explanation = f"Low qualification match ({skill_coverage}% skill overlap). Critical gaps present in: {', '.join(missing[:4]) if missing else 'Required stack'}."

        return JobMatchResponse(
            match_score=calculated_score,
            ats_score=max(40, calculated_score - 4),
            skill_coverage=skill_coverage,
            matched_skills=matched,
            missing_skills=missing,
            verdict=verdict,
            explanation=explanation,
        )


matching_service = JobMatchingService()
