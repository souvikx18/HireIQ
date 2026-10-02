import re
from typing import List, Dict, Any, Optional
from ai_service.schemas.resume import (
    ResumeAnalyzeResponse,
    ATSScoreBreakdown,
    SkillGapItem,
)
from ai_service.services.gemini_service import gemini_service
from ai_service.core.logging import logger

CORE_SKILLS_CATALOG = {
    "Frontend": ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js", "Vue.js", "Angular", "Redux"],
    "Backend": ["Python", "Node.js", "Express.js", "FastAPI", "Django", "Java", "Spring Boot", "Go", "C++", "C#", "SQL", "REST API", "GraphQL"],
    "Database": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch", "DynamoDB"],
    "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Azure", "GCP", "Linux", "Terraform", "Git"],
    "Architecture": ["System Design", "Microservices", "Data Structures", "Algorithms", "OOP", "DBMS", "Computer Networks"],
    "Soft Skills": ["Communication", "Problem Solving", "Leadership", "Teamwork", "Agile", "Scrum", "Collaboration"],
}

ALL_KNOWN_SKILLS = [skill for category in CORE_SKILLS_CATALOG.values() for skill in category]


class ResumeAnalyzerService:
    """Performs deep ATS scoring, entity extraction, and gap diagnosis."""

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        return match.group(0) if match else None

    @staticmethod
    def extract_phone(text: str) -> Optional[str]:
        match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
        return match.group(0) if match else None

    @staticmethod
    def extract_skills_heuristically(text: str) -> List[str]:
        found = []
        text_lower = text.lower()
        for skill in ALL_KNOWN_SKILLS:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                found.append(skill)
        return sorted(list(set(found)))

    @classmethod
    def analyze(
        cls,
        text: str,
        target_role: Optional[str] = None,
        required_skills: Optional[List[str]] = None,
        candidate_name: Optional[str] = None,
    ) -> ResumeAnalyzeResponse:
        """Runs multi-layer ATS evaluation combining heuristic rules and Gemini AI if configured."""
        heuristic_email = cls.extract_email(text)
        heuristic_phone = cls.extract_phone(text)
        heuristic_skills = cls.extract_skills_heuristically(text)

        # Check if Gemini AI can augment extraction
        ai_data = None
        if gemini_service.is_available:
            prompt = (
                f"You are an ATS Resume Analyzer. Analyze the following resume text:\n\n"
                f"{text[:10000]}\n\n"
                f"Target Role: {target_role or 'Software Engineer'}\n"
                f"Required Skills: {required_skills or []}\n\n"
                f"Output strictly a JSON with keys:\n"
                f"- candidate_name: string\n"
                f"- email: string or null\n"
                f"- phone: string or null\n"
                f"- experience_years: string (e.g. '3+ years')\n"
                f"- education: string\n"
                f"- detected_skills: list of strings\n"
                f"- ats_score: integer between 0 and 100\n"
                f"- score_breakdown: object with skills_match, experience_relevance, structure_and_formatting, ats_readability (each 0-100)\n"
                f"- strengths: list of 3 concise strings\n"
                f"- improvements: list of 3 actionable strings"
            )
            ai_data = gemini_service.generate_json_response(prompt)

        # Synthesize final result
        name = candidate_name or (ai_data.get("candidate_name") if ai_data else None)
        if not name:
            first_line = text.strip().split("\n")[0].strip()
            name = first_line[:50] if len(first_line) > 2 else "Candidate"

        email = (ai_data.get("email") if ai_data else None) or heuristic_email
        phone = (ai_data.get("phone") if ai_data else None) or heuristic_phone
        exp_years = (ai_data.get("experience_years") if ai_data else None) or "2+ years"
        education = (ai_data.get("education") if ai_data else None) or "Degree in Computer Science or related field"

        merged_skills = list(set(heuristic_skills + (ai_data.get("detected_skills", []) if ai_data else [])))
        if not merged_skills:
            merged_skills = ["Problem Solving", "Communication", "Technical Documentation"]

        # Calculate ATS scoring
        if ai_data and "ats_score" in ai_data:
            ats_score = int(ai_data["ats_score"])
            sb = ai_data.get("score_breakdown", {})
            score_breakdown = ATSScoreBreakdown(
                overall_score=ats_score,
                skills_match=int(sb.get("skills_match", ats_score)),
                experience_relevance=int(sb.get("experience_relevance", ats_score)),
                structure_and_formatting=int(sb.get("structure_and_formatting", 85)),
                ats_readability=int(sb.get("ats_readability", 90)),
            )
        else:
            # Deterministic ATS Scoring based on standard parsing benchmarks
            skill_score = min(100, int((len(merged_skills) / 10.0) * 100))
            format_score = 88 if ("education" in text.lower() and "experience" in text.lower()) else 72
            readability_score = 92 if len(text) > 400 else 65
            exp_score = 80 if ("year" in text.lower() or "developer" in text.lower()) else 65
            overall = int((skill_score * 0.4) + (format_score * 0.2) + (readability_score * 0.2) + (exp_score * 0.2))
            ats_score = max(40, min(98, overall))
            score_breakdown = ATSScoreBreakdown(
                overall_score=ats_score,
                skills_match=skill_score,
                experience_relevance=exp_score,
                structure_and_formatting=format_score,
                ats_readability=readability_score,
            )

        # Skill gap analysis
        target_check_skills = required_skills or [
            "React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "System Design"
        ]
        skill_gaps = []
        for req in target_check_skills:
            matched = any(req.lower() == s.lower() or req.lower() in s.lower() for s in merged_skills)
            skill_gaps.append(
                SkillGapItem(
                    skill=req,
                    status="matched" if matched else "missing",
                    importance="critical" if req in ["React", "Python", "SQL", "AWS"] else "medium",
                )
            )

        strengths = (ai_data.get("strengths") if ai_data else None) or [
            "Clear technical competency demonstrated across primary core stack",
            "Structured chronological work and education presentation",
            "Strong semantic density for engineering keyword recognition",
        ]

        improvements = (ai_data.get("improvements") if ai_data else None) or [
            "Quantify project achievements with measurable business impact (e.g. % performance increase)",
            "Incorporate targeted cloud and system design architecture keywords",
            "Standardize date formatting across all experience entries for optimal ATS indexing",
        ]

        return ResumeAnalyzeResponse(
            candidate_name=name,
            email=email,
            phone=phone,
            experience_years=exp_years,
            education=education,
            detected_skills=merged_skills,
            ats_score=ats_score,
            score_breakdown=score_breakdown,
            skill_gaps=skill_gaps,
            strengths=strengths,
            improvements=improvements,
            full_text_excerpt=text[:500] + "..." if len(text) > 500 else text,
        )


analyzer_service = ResumeAnalyzerService()
